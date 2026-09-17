import { Fragment } from "react";
import { Menu as MenuIcon } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";
import { Brands } from "@/components/Brands";
import SiteBackground from "@/components/site-background";
import ThemeToggle from "@/components/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS, ROUTES, isNavActive } from "@/config/links";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteBackground />

      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
          <MobileNavMenu />
          <Link
            to={ROUTES.home}
            aria-label="回到首页"
            className="shrink-0 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Brands className="h-7" />
          </Link>
          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((item) => (
              <DesktopNavItem key={item.to} to={item.to} label={item.label} />
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <BreadcrumbBar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}

function DesktopNavItem({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation();
  const active = isNavActive(pathname, to);

  return (
    <Button
      variant="ghost"
      size="sm"
      nativeButton={false}
      data-active={active || undefined}
      className="text-muted-foreground data-[active]:bg-muted data-[active]:text-foreground"
      render={
        <Link to={to} aria-current={active ? "page" : undefined} />
      }
    >
      {label}
    </Button>
  );
}

function MobileNavMenu() {
  const { pathname } = useLocation();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="打开导航菜单"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>导航</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2">
          {NAV_LINKS.map((item) => {
            const active = isNavActive(pathname, item.to);
            return (
              <SheetClose
                key={item.to}
                nativeButton={false}
                render={
                  <Link
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                  />
                }
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
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
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to={ROUTES.home} />}>
                home
              </BreadcrumbLink>
            </BreadcrumbItem>
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

function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row">
        <span>© {new Date().getFullYear()} useless technology</span>
        <span className="flex items-center gap-3">
          <Link className="transition-colors hover:text-foreground" to={ROUTES.docs}>
            Docs
          </Link>
          <Link className="transition-colors hover:text-foreground" to={ROUTES.tools}>
            Tools
          </Link>
        </span>
      </div>
    </footer>
  );
}
