import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Monitor, Moon, Sun } from "lucide-react";
import { gsap } from "gsap";
import SiteBackground from "@/components/site-background";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Brands } from "@/components/brands";
import GlideSelect, { type GlideSelectOption } from "@/components/glide-select";
import SplitText, { type SplitTextProps } from "@/components/split-text";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { ROUTES } from "@/config/links";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: ROUTES.docs, label: "Docs" },
  { to: ROUTES.tools, label: "Tools" },
];

function isNavActive(pathname: string, to: string) {
  if (to === ROUTES.home) return pathname === ROUTES.home;
  return pathname === to || pathname.startsWith(to + "/");
}

/** 主题选项：用 SVG 图标表示，文字仅供读屏 */
const THEME_OPTIONS: GlideSelectOption[] = [
  {
    value: "light",
    label: (
      <>
        <Sun className="size-4 block" />
        <span className="sr-only">浅色</span>
      </>
    ),
  },
  {
    value: "dark",
    label: (
      <>
        <Moon className="size-4 block" />
        <span className="sr-only">深色</span>
      </>
    ),
  },
  {
    value: "system",
    label: (
      <>
        <Monitor className="size-4 block" />
        <span className="sr-only">跟随系统</span>
      </>
    ),
  },
];

/** 主题选择：鼠标悬停或点击均可展开 */
function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  return (
    <GlideSelect
      options={THEME_OPTIONS}
      value={theme}
      onChange={(value) => setTheme(value as Theme)}
      ariaLabel="切换主题"
      align="right"
      menuWidth={76}
      openOnHover
      showArrow={false}
      ghost
      closeOnSelect={false}
      surfaceColor="var(--muted)"
      highlightColor="var(--border)"
      textColor="var(--foreground)"
      accentColor="var(--primary)"
    />
  );
}

/** 顶部主导航：激活态用一块会滑动的底色表示 */
function HeaderNav() {
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

  return (
    <NavigationMenu>
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

/** 面包屑逐字动画参数（进/出节奏一致） */
const BREADCRUMB_SPLIT = {
  tag: "span",
  textAlign: "left",
  delay: 20,
  duration: 0.45,
  ease: "power2.out",
  from: { opacity: 0, y: -10 },
  to: { opacity: 1, y: 0 },
  threshold: 0,
  rootMargin: "0px",
} satisfies Partial<SplitTextProps>;

/** 面包屑展开 / 收起耗时 */
const BREADCRUMB_COLLAPSE_MS = 320;

function BreadcrumbBar() {
  const { pathname } = useLocation();
  const isWide = useMediaQuery("(min-width: 640px)");
  /** 仅宽屏且非首页显示 */
  const visible = isWide && pathname !== ROUTES.home;
  const segments = pathname.split("/").filter(Boolean);

  const [mounted, setMounted] = useState(visible);
  const [expanded, setExpanded] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // 收起动画被打断时，把字符复位（否则会停在透明状态）
      const chars = bodyRef.current?.querySelectorAll(".split-char");
      if (chars?.length) {
        gsap.killTweensOf(chars);
        gsap.set(chars, { clearProps: "opacity,transform" });
      }
      // 下一帧再展开，保证折叠动画从 0fr 起步
      const frame = requestAnimationFrame(() => setExpanded(true));
      return () => cancelAnimationFrame(frame);
    }

    // 收起：字符逐字向上消失，容器同时向上折叠，折叠完成后卸载（不占空间）
    const chars = bodyRef.current?.querySelectorAll(".split-char");
    if (chars?.length) {
      gsap.to(chars, {
        opacity: 0,
        y: -10,
        duration: 0.24,
        ease: "power2.in",
        stagger: 0.012,
        overwrite: true,
      });
    }
    setExpanded(false);
    const timer = setTimeout(
      () => setMounted(false),
      BREADCRUMB_COLLAPSE_MS,
    );
    return () => clearTimeout(timer);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-linear",
        expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div ref={bodyRef} className="min-h-0">
        <div className="mx-auto w-full max-w-5xl px-4 pb-2">
          <Breadcrumb>
            <BreadcrumbList>
              {segments.map((segment, index) => {
                const to = "/" + segments.slice(0, index + 1).join("/");
                const isLast = index === segments.length - 1;
                return (
                  <Fragment key={to}>
                    {/* 首项前同样保留分隔符 */}
                    <BreadcrumbSeparator>
                      <SplitText
                        {...BREADCRUMB_SPLIT}
                        key={`sep-${index}-${pathname}`}
                        text="/"
                        className="select-none text-muted-foreground/50"
                      />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>
                          <SplitText
                            {...BREADCRUMB_SPLIT}
                            key={`item-${to}`}
                            text={segment}
                          />
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink render={<Link to={to} />}>
                          <SplitText
                            {...BREADCRUMB_SPLIT}
                            key={`item-${to}`}
                            text={segment}
                          />
                        </BreadcrumbLink>
                      )}
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

export default function AppLayout() {
  const showBrandName = useMediaQuery("(min-width: 640px)");

  return (
    <div className="flex min-h-svh flex-col">
      <SiteBackground />

      {/* 固定在顶部，不随页面滚动；背景透明 */}
      <header className="sticky top-0 z-40">
        <div className="mx-auto grid h-14 w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
          {/* 左：商标 + 导航 */}
          <div className="flex items-center gap-3 justify-self-start">
            <Link to={ROUTES.home} aria-label="返回首页">
              <Brands showName={showBrandName} />
            </Link>
            <HeaderNav />
          </div>

          {/* 中：暂为空，不占宽度 */}
          <div />

          {/* 右：主题切换等 */}
          <div className="flex items-center gap-1 justify-self-end">
            <ThemeSelect />
          </div>
        </div>
      </header>

      <BreadcrumbBar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
