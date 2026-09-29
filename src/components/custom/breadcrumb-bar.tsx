import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { gsap } from "gsap";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FlipChars, {
  type FlipCharsHandle,
  type FlipCharsProps,
} from "@/components/custom/flip-chars";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ROUTES } from "@/config/links";
import { cn } from "@/lib/utils";

/** 面包屑逐字翻转参数（翻入 / 翻出节奏一致） */
const BREADCRUMB_FLIP = {
  flip: "x",
  flipDuration: 0.32,
  stagger: 0,
  perspective: 600,
} satisfies Partial<FlipCharsProps>;

/** 展开 / 收起耗时 */
const BREADCRUMB_COLLAPSE_MS = 100;
/** 某一级离场后，后面的项滑过去补位的时长（秒） */
const BREADCRUMB_SLIDE = 0.32;

/** 一级面包屑：文字 + 它指向的路径 */
interface Crumb {
  text: string;
  path: string;
}

/** 正在离场的尾巴：路径变短时留在原处翻出的那几级 */
interface LeavingCrumb extends Crumb {
  /** 在列表里的层级，用来取回它的翻转实例 */
  level: number;
  /** 离场前是不是「当前页」（保持它的字色，别在翻出瞬间跳色） */
  wasCurrent: boolean;
}

/**
 * 路径段还原成可读文字：URL 里的中文是百分号编码（%E5%85%B6%E4%BB%96），
 * 直接显示就是一串转义符号。段里本来就有 `%` 时解码会抛错，原样返回即可。
 */
function decodeSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** 路径 → 各级（含前缀路径）：文字解码后展示，链接仍用原始（已编码）的路径段 */
function toCrumbs(prefixes: string[]): Crumb[] {
  return prefixes.map((text, level) => ({
    text: decodeSegment(text),
    path: "/" + prefixes.slice(0, level + 1).join("/"),
  }));
}

const sepKey = (level: number, round: number) => `sep-${level}-${round}`;
const itemKey = (level: number, round: number) => `item-${level}-${round}`;

/**
 * 面包屑：宽屏且非首页时出现，逐字翻入 / 原地翻出后折叠消失，不显示时不占空间。
 *
 * 各级用同一种包裹（<a>）和按层级固定的 key，导航时实例不会被重建：
 * - 同一级文字变了 → 交给 FlipChars 做字符 diff，只翻不同的字符；
 * - 路径变短 → 多出来的那几级留在原位逐字翻出，播完再摘掉，后面的项滑过去补位；
 * - 路径变长 → 只有新增的分隔符 / 那一级翻入，前面没变的不动；
 * - 收起（回首页 / 窄屏）→ 全部层级都算离场，原地翻出的同时容器向上折叠。
 */
export default function BreadcrumbBar() {
  const { pathname } = useLocation();
  const isWide = useMediaQuery("(min-width: 640px)");
  /** 仅宽屏且非首页显示 */
  const visible = isWide && pathname !== ROUTES.home;
  /**
   * 这一帧「应该显示的那份路径」，不显示时是 null（显示空）。
   * 首页 / 窄屏收起也走同一套 diff：那几级算离场，才能照样播翻出动画。
   */
  const target = visible ? pathname : null;
  const prefixes = visible ? pathname.split("/").filter(Boolean) : [];
  const crumbs = toCrumbs(prefixes);

  const [mounted, setMounted] = useState(visible);
  const [expanded, setExpanded] = useState(false);
  /**
   * 每次出现都换一批实例：收起时字符已经翻出并摘掉，
   * （出现被打断时）只有重建这批字符才能重播翻入。
   */
  const [round, setRound] = useState(0);
  /** 上一次「应该显示」的路径（null = 显示空） */
  const [shownPath, setShownPath] = useState<string | null>(target);
  /** 正在离场的尾巴 */
  const [leaving, setLeaving] = useState<LeavingCrumb[]>([]);
  /** 各分隔符 / 各段的翻转实例 */
  const handlesRef = useRef(new Map<string, FlipCharsHandle>());
  const listRef = useRef<HTMLOListElement>(null);

  // 渲染期同步（不能等到 effect，否则会多渲染一帧旧内容）：
  // 层级变少 —— 包括「收起成空」—— 多出来的那几级就留在原位翻出
  if (shownPath !== target) {
    const seen = shownPath ? shownPath.split("/").filter(Boolean) : [];
    setShownPath(target);
    setLeaving(
      seen.length > prefixes.length
        ? seen.slice(prefixes.length).map((text, index) => ({
            text: decodeSegment(text),
            path: "/" + seen.slice(0, prefixes.length + index + 1).join("/"),
            level: prefixes.length + index,
            wasCurrent: prefixes.length + index === seen.length - 1,
          }))
        : [],
    );
  }

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setRound((value) => value + 1);
      // 下一帧再展开，保证折叠动画从 0fr 起步
      const frame = requestAnimationFrame(() => setExpanded(true));
      return () => cancelAnimationFrame(frame);
    }

    // 收起：字符原地翻出（离场那几级也要留着，动画才看得见），容器同时向上折叠，
    // 折叠完成后卸载（不占空间）
    for (const handle of handlesRef.current.values()) void handle.remove();
    setExpanded(false);
    const timer = setTimeout(() => setMounted(false), BREADCRUMB_COLLAPSE_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  // 离场的那几级：先逐字翻出，翻完再摘掉（后面的项由下面的 FLIP 滑过去补位）
  useEffect(() => {
    if (!leaving.length) return;
    for (const crumb of leaving) {
      void handlesRef.current.get(sepKey(crumb.level, round))?.remove();
      void handlesRef.current.get(itemKey(crumb.level, round))?.remove();
    }
    const longest = Math.max(...leaving.map((crumb) => crumb.text.length), 1);
    const wait =
      (BREADCRUMB_FLIP.flipDuration + BREADCRUMB_FLIP.stagger * (longest - 1)) *
        1000 +
      40;
    const timer = setTimeout(() => setLeaving([]), wait);
    return () => clearTimeout(timer);
  }, [leaving, round]);

  /**
   * 项级 FLIP：某一级变宽 / 变窄，或离场项被摘掉时，后面的项滑过去补位。
   * 字符级的滑移由 FlipChars 自己负责，这里只管 <li> 这一层。
   */
  const placedRef = useRef(new Map<Element, { x: number; y: number }>());
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !visible || !expanded) {
      placedRef.current.clear();
      return;
    }
    const next = new Map<Element, { x: number; y: number }>();
    for (const item of [...list.children]) {
      const el = item as HTMLElement;
      next.set(el, { x: el.offsetLeft, y: el.offsetTop });
    }
    for (const [item, from] of placedRef.current) {
      const el = item as HTMLElement;
      gsap.killTweensOf(el);
      const to = next.get(item);
      if (!to || !el.isConnected) continue;
      const dx = from.x - to.x;
      const dy = from.y - to.y;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        gsap.set(el, { clearProps: "x,y" });
        continue;
      }
      // 先钉在改动前的位置，再滑回 0（不动画时不残留 transform）
      gsap.fromTo(
        el,
        { x: dx, y: dy },
        {
          x: 0,
          y: 0,
          duration: BREADCRUMB_SLIDE,
          ease: "power2.out",
          clearProps: "x,y",
        },
      );
    }
    placedRef.current = next;
  });

  if (!mounted) return null;

  /** 句柄登记：收起 / 离场时要能拿到每一个实例 */
  const register = (key: string) => (handle: FlipCharsHandle | null) => {
    if (handle) handlesRef.current.set(key, handle);
    else handlesRef.current.delete(key);
  };

  const levels = [
    ...crumbs.map((crumb, level) => ({
      crumb,
      level,
      leaving: false,
      current: level === crumbs.length - 1,
    })),
    ...leaving.map((crumb) => ({
      crumb,
      level: crumb.level,
      leaving: true,
      current: crumb.wasCurrent,
    })),
  ];

  return (
    <div
      className={cn(
        "grid overflow-hidden transition-[grid-template-rows] duration-100 ease-linear",
        expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="min-h-0">
        <div className="mx-auto w-full max-w-5xl px-4 pb-2">
          <Breadcrumb>
            <BreadcrumbList ref={listRef}>
              {levels.map(({ crumb, level, leaving: isLeaving, current }) => {
                const sKey = sepKey(level, round);
                const iKey = itemKey(level, round);
                return (
                  <Fragment key={level}>
                    {/* 首项前同样保留分隔符 */}
                    <BreadcrumbSeparator>
                      <FlipChars
                        {...BREADCRUMB_FLIP}
                        key={sKey}
                        ref={register(sKey)}
                        text=">"
                        className="select-none text-muted-foreground/50"
                      />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem
                      className={isLeaving ? "pointer-events-none" : undefined}
                    >
                      <BreadcrumbLink
                        render={<Link to={crumb.path} replace={current} />}
                        aria-current={
                          current && !isLeaving ? "page" : undefined
                        }
                        tabIndex={current ? -1 : undefined}
                        className={
                          current
                            ? "pointer-events-none font-normal text-foreground"
                            : undefined
                        }
                      >
                        <FlipChars
                          {...BREADCRUMB_FLIP}
                          key={iKey}
                          ref={register(iKey)}
                          text={crumb.text}
                        />
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </div>
  );
}
