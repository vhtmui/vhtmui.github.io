import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "../utils";
import { Monitor, ChevronDown } from "lucide-react";

const THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "dracula",
  "winter",
  "nord",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "dim",
  "abyss",
  "caramellatte",
  "cmyk",
  "fantasy",
  "luxury",
  "silk",
  "sunset",
  "wireframe",
];

const THEME_KEY = "theme";

/**
 * 返回系统偏好主题
 * @returns 系统偏好主题，dark 或 light
 */
function systemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * 返回实际应用的主题，并更新 document.documentElement.dataset.theme
 * @param theme 要应用的主题，null 表示跟随系统
 */
function applyTheme(theme: string | null): string {
  const resolved = theme === "system" || !theme ? systemTheme() : theme;
  document.documentElement.dataset.theme = resolved;
  return resolved;
}

applyTheme(localStorage.getItem(THEME_KEY));

type ThemeSelectorSize = "xs" | "sm" | "md" | "lg";

const SIZE_STYLES: Record<
  ThemeSelectorSize,
  { btn: string; dot: string; chevron: string }
> = {
  xs: { btn: "btn-xs", dot: "size-2.5", chevron: "size-3" },
  sm: { btn: "btn-sm", dot: "size-3", chevron: "size-3.5" },
  md: { btn: "btn-md", dot: "size-3.5", chevron: "size-4" },
  lg: { btn: "btn-lg", dot: "size-4", chevron: "size-5" },
};

export default function ThemeSelector({
  className,
  size = "sm",
}: {
  className?: string;
  size?: ThemeSelectorSize;
}) {
  const [localTheme, setLocaltheme] = useState<string>(
    () => localStorage.getItem(THEME_KEY) ?? "system",
  );
  const [dataTheme, setDataTheme] = useState<string>(
    () => document.documentElement.dataset.theme ?? systemTheme(),
  );

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDataTheme(el.dataset.theme ?? systemTheme());
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  function selectTheme(theme: string) {
    localStorage.setItem(THEME_KEY, theme);
    setLocaltheme(theme);
    setDataTheme(applyTheme(theme));
  }

  const menuStyle = {
    "--menu-active-bg": "var(--color-primary)",
    "--menu-active-fg": "var(--color-primary-content)",
  } as CSSProperties;

  const s = SIZE_STYLES[size];

  return (
    <div
      className={cn(
        "dropdown dropdown-end dropdown-bottom",
        "hover:before:absolute hover:before:top-full hover:before:right-0 hover:before:w-52 hover:before:h-2",

        className,
      )}
    >
      {/* 触发器：当前主题色点 + 下拉箭头 */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-label="切换主题"
        className={cn("btn btn-ghost rounded-full", s.btn)}
      >
        <span
          data-theme={dataTheme}
          aria-hidden
          className={cn(
            "rounded-full bg-primary ring-1 ring-base-content/40",
            s.dot,
          )}
        />
        <ChevronDown className={s.chevron} />
      </button>

      {/* 弹出菜单 */}
      <ul
        role="menu"
        aria-label="主题列表"
        tabIndex={-1}
        style={menuStyle}
        className={cn(
          "dropdown-content menu menu-sm",
          "mt-2 max-h-[min(60vh,24rem)] w-52 flex-nowrap gap-1 overflow-y-auto",
          "rounded-box border border-base-300 bg-base-100 p-2 shadow-xl",
        )}
      >
        <li className="menu-title menu-disabled">
          <span className="text-base-content/60 text-xs">Theme</span>
        </li>

        {/* 跟随系统 */}
        <li>
          <button
            onClick={() => selectTheme("system")}
            className={cn(
              "flex w-full items-center justify-between gap-3",
              localTheme === "system" && "menu-active",
            )}
          >
            <span className="flex items-center gap-2">
              <Monitor size={16} />
              <span>System</span>
            </span>
            <span className="text-xs opacity-60">{systemTheme()}</span>
          </button>
        </li>

        {THEMES.map((theme) => (
          <li key={theme}>
            <button
              onClick={() => selectTheme(theme)}
              className={cn(
                "flex w-full items-center gap-3",
                localTheme === theme && "menu-active",
              )}
            >
              <span
                data-theme={theme}
                aria-hidden
                className="pointer-events-none size-3 shrink-0 rounded-full bg-primary"
              />
              <span className="min-w-0 truncate capitalize">{theme}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function systemThemeChange() {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    if (localStorage.getItem(THEME_KEY) === "system") {
      document.documentElement.dataset.theme = mq.matches ? "dark" : "light";
    }
  };
  mq.addEventListener("change", apply);
  apply();
  return () => mq.removeEventListener("change", apply);
}
