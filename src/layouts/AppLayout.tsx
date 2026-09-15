import { Link, Outlet, useLocation } from "react-router";
import ThemeSelector from "../components/ThemeSelector";
import { cn } from "../utils";
import { Brands } from "../components/Brands";

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
  const { pathname } = useLocation();
  return (
    <nav className="navbar border-b border-base-300">
      <div className="navbar-start">
       <Brands></Brands>
      </div>
      <div className="navbar-center flex items-center gap-4">
        <div className="tabs tabs-border">
          {navLinks.map((item) => {
            const active = isNavActive(pathname, item.to);
            return (
              <Link
                className={cn("tab font-medium", active && "tab-active")}
                role="tab"
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="navbar-end"></div>
    </nav>
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

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/docs", label: "Docs" },
  { to: "/tools", label: "Tools" },
];

function isNavActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(to + "/");
}
