import { Fragment } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Monitor, Moon, Sun } from "lucide-react";
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
import { Brands } from "@/components/Brands";
import GlideSelect, { type GlideSelectOption } from "@/components/GlideSelect";
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

/** 顶部主导航（放在 header 中间一栏） */
function HeaderNav() {
  const { pathname } = useLocation();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {NAV_LINKS.map((item) => {
          const active = isNavActive(pathname, item.to);
          return (
            <NavigationMenuItem key={item.to}>
              <NavigationMenuLink
                render={
                  <Link
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                  />
                }
                className={cn(
                  navigationMenuTriggerStyle(),
                  "no-underline",
                  active && "bg-muted text-foreground",
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

function BreadcrumbBar() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="border-b bg-muted/30 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-5xl px-4 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((segment, index) => {
              const to = "/" + segments.slice(0, index + 1).join("/");
              const isLast = index === segments.length - 1;
              return (
                <Fragment key={to}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{segment}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink render={<Link to={to} />}>
                        {segment}
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
