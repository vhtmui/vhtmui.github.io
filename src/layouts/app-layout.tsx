import { Link, Outlet } from "react-router";
import { Brands } from "@/components/custom/brands";
import BreadcrumbBar from "@/components/custom/breadcrumb-bar";
import HeaderNav from "@/components/custom/header-nav";
import SiteBackground from "@/components/custom/site-background";
import ThemeSelect from "@/components/custom/theme-select";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ROUTES } from "@/config/links";

export default function AppLayout() {
  const showBrandName = useMediaQuery("(min-width: 640px)");

  return (
    <div className="flex min-h-svh flex-col">
      <SiteBackground />

      <header className="sticky top-0 z-40">
        <div className="mx-auto grid h-14 w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
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

      <BreadcrumbBar />

      <main className="typeset typeset-docs mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
