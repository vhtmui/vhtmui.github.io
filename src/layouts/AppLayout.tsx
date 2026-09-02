import { Link, Outlet } from "react-router";
import ThemeSelector from "../components/ThemeSelector";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/docs", label: "Docs" },
  { to: "/tools", label: "Tools" },
];

export default function AppLayout() {
  return (
    <>
      <header className="">
        <nav className="navbar">
          <div className="navbar-start"></div>
          <div className="navbar-center flex items-center gap-4">
            {navLinks.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
          <ThemeSelector className="navbar-end" />
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </>
  );
}
