import { useEffect, useRef } from "react";
import { Menu as MenuIcon } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";
import ThemeSelector from "../components/ThemeSelector";
import { cn } from "../utils";
import { Brands } from "../components/Brands";
import { NAV_LINKS, isNavActive } from "../config/links";

export default function AppLayout() {
  return (
    <>
      <header className="">
        <Navbar />
        <Breadcrumb />
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </>
  );
}

function Navbar() {
  return (
    <nav className="navbar border-b border-base-300">
      <div className="navbar-start">
        <div className="lg:hidden mr-1">
          <MobileNavMenu />
        </div>
        <Brands href="/"></Brands>
        <div className="hidden lg:block">
          <NavMenu />
        </div>
      </div>
      <div className="navbar-center flex items-center gap-4"></div>
      <div className="navbar-end"></div>
    </nav>
  );
}

function NavMenu({
  orientation = "horizontal",
  className,
  onNavigate,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  return (
    <ul
      className={cn(
        "menu",
        orientation === "horizontal" ? "menu-horizontal" : "menu-vertical",
        className,
      )}
    >
      {NAV_LINKS.map((item) => {
        const active = isNavActive(pathname, item.to);
        return (
          <li key={item.to}>
            <Link
              className={cn("font-medium", active && "menu-active")}
              role="tab"
              to={item.to}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function MobileNavMenu() {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const details = detailsRef.current;
      if (details?.open && !details.contains(event.target as Node)) {
        details.open = false;
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <details ref={detailsRef} className="dropdown">
      <summary
        className="btn btn-ghost btn-square btn-sm"
        aria-label="打开导航菜单"
      >
        <MenuIcon className="size-5" />
      </summary>
      <NavMenu
        orientation="vertical"
        onNavigate={close}
        className="dropdown-content mt-2 w-52 rounded-box bg-base-100 p-2 shadow-sm"
      />
    </details>
  );
}

function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  return (
    <div className="nav bg-base-200 border-b border-base-300 py-1 pl-4 text-sm font-light">
      <div className="breadcrumbs navbar-start py-0">
        <ul>
          {segments.map((item, index) => {
            const to = "/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;
            return (
              <li key={to}>
                {isLast ? (
                  item
                ) : (
                  <Link to={to} className="hover:underline">
                    {item}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="navbar-end">
        <ThemeSelector className="" size="xs" />
      </div>
    </div>
  );
}
