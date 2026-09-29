import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ROUTES } from "@/config/links";
import { cn } from "@/lib/utils";

/** 主导航项 */
const NAV_LINKS = [
  { to: ROUTES.docs, label: "Docs" },
  { to: ROUTES.tools, label: "Tools" },
  { to: ROUTES.playground, label: "Playground" },
];

function isNavActive(pathname: string, to: string) {
  if (to === ROUTES.home) return pathname === ROUTES.home;
  return pathname === to || pathname.startsWith(to + "/");
}

/** 顶部主导航：激活态用一块会滑动的底色表示 */
export default function HeaderNav() {
  const { pathname } = useLocation();
  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<Array<HTMLElement | null>>([]);
  const pillRef = useRef<HTMLSpanElement>(null);
  const firstRef = useRef(true);

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const activeIndex = NAV_LINKS.findIndex((item) =>
    isNavActive(pathname, item.to),
  );
  /** 色块位置：优先跟随鼠标悬停项，移开后回到激活项 */
  const pillIndex = hoverIndex ?? activeIndex;

  /** 把底色块对齐到目标项 */
  const syncPill = useCallback(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;

    const link = pillIndex >= 0 ? linkRefs.current[pillIndex] : null;
    if (!link) {
      pill.style.opacity = "0";
      return;
    }

    const listRect = list.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    // 首次定位直接落位，避免从左上角滑入
    if (firstRef.current) pill.style.transition = "none";
    pill.style.opacity = "1";
    pill.style.width = `${linkRect.width}px`;
    pill.style.height = `${linkRect.height}px`;
    pill.style.transform = `translate(${linkRect.left - listRect.left}px, ${
      linkRect.top - listRect.top
    }px)`;
    if (firstRef.current) {
      void pill.offsetWidth;
      pill.style.transition = "";
      firstRef.current = false;
    }
  }, [pillIndex]);

  useLayoutEffect(() => {
    syncPill();
    document.fonts.ready.then(syncPill).catch(() => {});
  }, [syncPill]);

  useEffect(() => {
    window.addEventListener("resize", syncPill);
    return () => window.removeEventListener("resize", syncPill);
  }, [syncPill]);

  /**
   * 窄屏下三个药丸放不进顶栏：与其让整页横向溢出（移动端会因此缩放页面），
   * 不如让导航自己横向滚动。min-w-0 + overflow-x-auto 把这一层的最小宽度降到 0，
   * 顶栏因此永远撑不出屏幕；px-1 / py-1 是给 focus 环留的余量（overflow 在 padding
   * 边界裁剪，不留边就会被切）。滚动条隐藏：能滚动就够了，不必占掉药丸下方的空间。
   * （不用 IDE 提示的 scrollbar-none：装的是 tailwindcss 4.3.3，没有这个工具类）
   */
  return (
    <NavigationMenu className="min-w-0 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <NavigationMenuList
        ref={listRef}
        className="relative"
        onPointerLeave={() => setHoverIndex(null)}
      >
        {/* 滑动的激活底色：位移/宽度都参与过渡，节奏与 GlideSelect 一致 */}
        <span
          ref={pillRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-0 rounded-lg bg-muted opacity-0 transition-[transform,width,height,opacity] duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
        />
        {NAV_LINKS.map((item, i) => {
          const active = isNavActive(pathname, item.to);
          return (
            <NavigationMenuItem key={item.to}>
              <NavigationMenuLink
                ref={(el: HTMLElement | null) => {
                  linkRefs.current[i] = el;
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setHoverIndex(i);
                }}
                render={
                  <Link
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                  />
                }
                className={cn(
                  navigationMenuTriggerStyle(),
                  // 底色交给滑动的色块，不要自带 hover / focus 背景
                  "relative z-1 no-underline hover:bg-transparent focus:bg-transparent",
                  // 320px 这类极窄屏再收紧药丸内边距，三个标签才都能露出来（不至于只剩滚动）
                  "max-[360px]:px-1.5",
                  active && "text-foreground",
                )}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
