import { useRef } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Brands } from "@/components/custom/brands";
import BreadcrumbBar from "@/components/custom/breadcrumb-bar";
import HeaderNav from "@/components/custom/header-nav";
import SiteBackground from "@/components/custom/site-background";
import ThemeSelect from "@/components/custom/theme-select";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ROUTES } from "@/config/links";
import { cn } from "@/lib/utils";

/** 是不是 docs 或它的子页面 */
function isDocsRoute(pathname: string) {
  return pathname === ROUTES.docs || pathname.startsWith(`${ROUTES.docs}/`);
}

export default function AppLayout() {
  const showBrandName = useMediaQuery("(min-width: 640px)");
  const { pathname } = useLocation();
  const headerRef = useRef<HTMLDivElement>(null);
  /** 面包屑：向上滚时它贴住视口上边界就停住，不跟着整块滚出屏幕 */
  const crumbRef = useRef<HTMLDivElement>(null);
  /** docs 体系里顶栏与面包屑都铺满屏幕，正文仍按 5xl 居中 */
  const wideHeader = isDocsRoute(pathname);

  useHideOnScroll(headerRef, crumbRef);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteBackground />

      {/*
        顶栏和面包屑装在同一个 sticky 容器里：useHideOnScroll 位移的是这一整块，
        两者始终同步滚入滚出；收起距离取容器自身高度，面包屑收起来时会自动变短。
      */}
      <div ref={headerRef} className="sticky top-0 z-40">
        <header>
          <div
            className={cn(
              // 左右两组各自 auto、中间一份 1fr 吃掉余量：这样窄屏时左组（品牌 + 导航）
              // 可以按自己的最小尺寸收缩，而不会把右边的主题选择顶出屏幕
              // （原来是 1fr auto 1fr：中间列固定 0，两边都按最小内容宽度撑，320px 下
              // 品牌 + 三个药丸 + 主题选择最少要 328，文档就横向溢出了 8px）
              "mx-auto grid h-14 w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-4",
              // 只过渡 max-width：容器一直是居中的，宽度一变，左右两组按钮就各自
              // 平滑地滑到新位置（max-width 由 64rem 过渡到 100%，浏览器按 calc 插值）
              "transition-[max-width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
              wideHeader ? "max-w-full" : "max-w-5xl",
            )}
          >
            <div className="flex items-center gap-3 justify-self-start">
              <Link to={ROUTES.home} aria-label="返回首页">
                <Brands showName={showBrandName} />
              </Link>
              <HeaderNav />
            </div>
            {/* 中：暂为空，不占宽度 */}
            <div />
            <div className="flex items-center gap-1 justify-self-end">
              <ThemeSelect />
            </div>
          </div>
        </header>

        <BreadcrumbBar wide={wideHeader} ref={crumbRef} />
      </div>

      <main className="typeset typeset-docs mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
