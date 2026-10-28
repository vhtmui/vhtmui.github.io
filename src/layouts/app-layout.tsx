import { Link, Outlet, useLocation } from "react-router";
import { Brands } from "@/components/custom/brands";
import BreadcrumbBar from "@/components/custom/breadcrumb-bar";
import HeaderNav from "@/components/custom/header-nav";
import ThemeSelect from "@/components/custom/theme-select";
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
  /** docs 体系里顶栏与面包屑都铺满屏幕，正文仍按 5xl 居中 */
  const wideHeader = isDocsRoute(pathname);

  return (
    <div className="flex min-h-svh flex-col">

      {/*
        顶栏和面包屑装在同一个 sticky 容器里：固定钉在视口顶部，滚动时一直可见
        （不做「下滚收起、上滚露出」，避免切页回来时状态错位）。
        背景保持透明，不铺底色、也不加毛玻璃。
      */}
      <div className="sticky top-0 z-40">
        <header>
          <div
            className={cn(
              // 左右两组各自 auto、中间一份 1fr 吃掉余量：这样窄屏时左组（品牌 + 导航）
              // 可以按自己的最小尺寸收缩，而不会把右边的主题选择顶出屏幕
              // （原来是 1fr auto 1fr：中间列固定 0，两边都按最小内容宽度撑，320px 下
              // 品牌 + 三个药丸 + 主题选择最少要 328，文档就横向溢出了 8px）
              "mx-auto grid h-14 w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-4",
              // 只过渡 max-width：容器一直是居中的，宽度一变，左右两组按钮就各自
              // 平滑地滑到新位置（max-width 由 64rem 过渡到内容区宽度的 125%，
              // 浏览器按 calc 插值）
              "transition-[max-width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
              // docs 页面不铺满整屏：最宽到「正文 + 两侧导航」的 125%（见 main.css 的
              // .docs-shell），4K 下两端的品牌与主题选择不会贴到屏幕边缘
              wideHeader ? "docs-shell" : "max-w-5xl",
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

        <BreadcrumbBar wide={wideHeader} />
      </div>

      {/*
        docs 体系里正文栏自己按 --docs-article 居中，外层不能再卡在 5xl：
        否则 2K/4K 下正文宽度上限被压回 1024px，两侧导航往外挪也没意义。
      */}
      <main
        className={cn(
          "typeset typeset-docs mx-auto w-full flex-1 px-4 py-8",
          wideHeader ? "max-w-none" : "max-w-5xl",
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
