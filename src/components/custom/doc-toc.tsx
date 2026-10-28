import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/markdown.server";

/**
 * 章节导航。
 *
 * 目录是构建期从 markdown 标题收集的扁平列表（文档顺序），嵌套关系在这里
 * 按层级现算：二级标题是"节"，三级及以下挂在它下面。二级默认折叠，浏览到哪一节
 * 就只展开那一节。
 *
 * 高亮不止一项：视口里还有正文的章节全都亮起来（位置由 useDocReading 给出），
 * 长文档里一屏能同时看到好几节，逐节高亮比只标一个"当前"更贴合实际读到的位置。
 * 自动展开、自动居中仍只看"当前位置最细的标题"（activeId），否则多项高亮会让
 * 目录自己来回跳。
 */

/** 章节树节点 */
interface TocNode extends TocItem {
  children: TocNode[];
}

/** 扁平目录 → 树：遇到不比自己浅的标题就回退，挂到第一个更浅的节点下 */
function buildTree(items: TocItem[]) {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];

  for (const item of items) {
    const node: TocNode = { ...item, children: [] };
    while (stack.length && stack[stack.length - 1].level >= item.level) stack.pop();
    (stack.length ? stack[stack.length - 1].children : roots).push(node);
    stack.push(node);
  }

  return roots;
}

/** 每个节点所属的顶层节点（也就是"第几节"） */
function mapRoots(roots: TocNode[]) {
  const map = new Map<string, string>();
  const walk = (nodes: TocNode[], rootId: string) => {
    for (const node of nodes) {
      map.set(node.id, rootId);
      walk(node.children, rootId);
    }
  };
  for (const root of roots) {
    map.set(root.id, root.id);
    walk(root.children, root.id);
  }
  return map;
}

/** 最近的可滚动祖先：目录在宽屏是 fixed 侧栏、窄屏是卡片里的 div，位置不固定 */
function findScroller(from: HTMLElement) {
  let node = from.parentElement;

  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll)/.test(overflowY) && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }

  return null;
}

/**
 * 把当前高亮项带到目录容器的中线。
 *
 * 长目录在容器里自己滚动，阅读位置往前走时高亮会滑出可视区，所以要跟着挪；
 * 偏差不到容器四分之一高时不动，免得相邻标题来回切换时目录跟着抖。
 * 首次（含带 #hash 直接打开）用瞬时定位，之后才走平滑滚动。
 */
function useCenterActive(currentId: string | null) {
  const navRef = useRef<HTMLElement>(null);
  const isFirstRef = useRef(true);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !currentId) return;

    const current = nav.querySelector<HTMLElement>(`[data-active-id="${currentId}"]`);
    if (!current) return;

    const scroller = findScroller(current);
    if (!scroller) return;

    const currentRect = current.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const drift =
      currentRect.top - scrollerRect.top - (scroller.clientHeight - currentRect.height) / 2;

    const first = isFirstRef.current;
    isFirstRef.current = false;

    if (!first && Math.abs(drift) < scroller.clientHeight / 4) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({
      top: scroller.scrollTop + drift,
      behavior: first || reduceMotion ? "auto" : "smooth",
    });
  }, [currentId]);

  return navRef;
}

/** 一条正文标题：三级及以下都是可点的锚点，再深一层再多缩进一档 */
function TocLeaf({
  node,
  activeId,
  visibleIds,
  depth,
  onJump,
}: {
  node: TocNode;
  activeId: string | null;
  /** 视口内还有正文的标题，命中就高亮 */
  visibleIds: ReadonlySet<string>;
  depth: number;
  onJump: (id: string) => void;
}) {
  const visible = visibleIds.has(node.id);

  return (
    <li>
      <a
        href={`#${node.id}`}
        // 同一组里 aria-current 只该有一个：「当前」仍按 activeId 标，
        // 视口内其余章节只用底色区分（无障碍上不至于出现多个"当前位置"）
        aria-current={activeId === node.id ? "location" : undefined}
        // 自动居中靠它定位当前项（见 useCenterActive）
        data-active-id={activeId === node.id ? node.id : undefined}
        onClick={(event) => {
          event.preventDefault();
          onJump(node.id);
        }}
        // 缩进按相对深度递进（二级标题 0.5rem 起），标题层级再深也不会挤在一起
        style={{ paddingInlineStart: `${0.5 + depth * 0.5}rem` }}
        className={cn(
          "block truncate rounded-md py-1 pr-2 transition-colors outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
          visible ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {node.text}
      </a>
      {node.children.length ? (
        <ul>
          {node.children.map((child) => (
            <TocLeaf
              key={child.id}
              node={child}
              activeId={activeId}
              visibleIds={visibleIds}
              depth={depth + 1}
              onJump={onJump}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export interface DocTocProps {
  /** 构建期收集的扁平目录（文档顺序） */
  items: TocItem[];
  /** 当前位置最细的标题 id：只决定自动展开哪一节、自动居中到哪一项 */
  activeId: string | null;
  /** 视口内还有正文的标题 id（文档顺序）：这些条目一起高亮 */
  visibleIds: readonly string[];
  /** 条目跳转后回调（窄屏卡片用它收起） */
  onNavigate?: () => void;
}

/**
 * 章节导航本体。
 *
 * 展开状态全部在渲染期算出来，不用 effect 回写：
 * - 默认自动展开「视口里还有正文的节」和「当前位置所在的那一节」，滚动到哪就开到哪；
 * - 手动开合只记一层临时覆盖，且只在阅读位置没变时有效：一旦滚到别的节，这次手动
 *   干预就作废（渲染期直接清掉），之后再滚回来照样按位置自动展开 —— 不会出现
 *   "手动收起过一次，滚走再滚回来就一直合着"。
 */
export default function DocToc({
  items,
  activeId,
  visibleIds,
  onNavigate,
}: DocTocProps) {
  const roots = useMemo(() => buildTree(items), [items]);
  const rootOf = useMemo(() => mapRoots(roots), [roots]);
  const activeRootId = activeId ? (rootOf.get(activeId) ?? null) : null;
  const visibleSet = useMemo(() => new Set(visibleIds), [visibleIds]);

  /** 自动展开的节：视口内还有正文的（含子节可见的情况）+ 当前所在的那一节 */
  const autoOpen = useMemo(() => {
    const ids = new Set<string>();
    for (const id of visibleIds) {
      const rootId = rootOf.get(id);
      if (rootId) ids.add(rootId);
    }
    if (activeRootId) ids.add(activeRootId);
    return ids;
  }, [visibleIds, rootOf, activeRootId]);

  /**
   * 手动开合覆盖：`at` 是按下时的阅读位置（所在的节），overrides 是 id → 是否展开。
   * 阅读位置一变，这次干预就该失效，所以要一起清掉，而不只是"暂时不采用"。
   */
  const [manual, setManual] = useState<{
    at: string | null;
    overrides: Record<string, boolean>;
  } | null>(null);

  const overrides = manual && manual.at === activeRootId ? manual.overrides : null;
  // 渲染期同步清掉过期的手动状态：留着它，滚回同一节时会被重新套用（正是要修的问题）
  if (manual && !overrides) setManual(null);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    onNavigate?.();
  };

  // 阅读位置变了就把当前项带进容器中线
  const navRef = useCenterActive(activeId);

  if (!roots.length) return null;

  return (
    <nav ref={navRef} aria-label="章节导航" className="flex flex-col gap-0.5 text-sm">
      {roots.map((root) => {
        const hasKids = root.children.length > 0;
        /** 手动覆盖优先，其次看这一节是否自动展开 */
        const open = overrides?.[root.id] ?? autoOpen.has(root.id);
        const current = activeRootId === root.id;
        /** 这一节的正文还在视口里（含它的子节），整行高亮 */
        const visible = visibleSet.has(root.id);
        const rowClass = cn(
          "flex w-full cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50",
          // 在视口里的节铺底色；正在读的那一节再把字色加深，位置更好找
          visible ? "bg-muted text-foreground" : "text-muted-foreground",
          current && "font-medium text-foreground",
        );

        return (
          <div key={root.id} className="flex flex-col gap-0.5">
            {hasKids ? (
              // 有子项：这一行管展开（不跳转），高亮看本节是否还在视口内
              <button
                type="button"
                aria-expanded={open}
                data-active-id={activeId === root.id ? root.id : undefined}
                aria-current={activeId === root.id ? "location" : undefined}
                onClick={() =>
                  setManual({
                    at: activeRootId,
                    overrides: { ...overrides, [root.id]: !open },
                  })
                }
                className={rowClass}
              >
                <span className="min-w-0 flex-1 truncate">{root.text}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-3.5 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
                    open && "rotate-180",
                  )}
                />
              </button>
            ) : (
              <a
                href={`#${root.id}`}
                data-active-id={activeId === root.id ? root.id : undefined}
                aria-current={activeId === root.id ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  jump(root.id);
                }}
                className={rowClass}
              >
                <span className="min-w-0 flex-1 truncate">{root.text}</span>
              </a>
            )}

            {hasKids ? (
              // grid-rows 0fr→1fr：展开收起都有高度过渡，不用 JS 量高度
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <ul className="min-h-0 overflow-hidden">
                  {root.children.map((child) => (
                    <TocLeaf
                      key={child.id}
                      node={child}
                      activeId={activeId}
                      visibleIds={visibleSet}
                      depth={1}
                      onJump={jump}
                    />
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
