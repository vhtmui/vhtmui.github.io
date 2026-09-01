import { Link, Outlet } from "react-router";
import ThemeSelector from "../components/ThemeSelector";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/docs", label: "Docs" },
  { to: "/mac-converter", label: "MAC Converter" },
  { to: "/testpage", label: "Test Page" },
];

export default function AppLayout() {
  return (
    <>
      <header className="site-header">
        <nav className="site-nav">
          {navLinks.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
        <ThemeSelector />
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </>
  );
}
