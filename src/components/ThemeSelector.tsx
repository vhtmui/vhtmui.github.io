import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "../utils";

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

function systemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: string | null): string {
  const resolved = theme === "system" || !theme ? systemTheme() : theme;
  document.documentElement.dataset.theme = resolved;
  return resolved;
}

applyTheme(localStorage.getItem(THEME_KEY));

export default function ThemeSelector({ className }: { className?: string }) {
  const [pref, setPref] = useState<string>(
    () => localStorage.getItem(THEME_KEY) ?? "system",
  );
  const [applied, setApplied] = useState<string>(
    () => document.documentElement.dataset.theme ?? systemTheme(),
  );

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setApplied(el.dataset.theme ?? systemTheme());
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const selectTheme = (theme: string) => {
    localStorage.setItem(THEME_KEY, theme);
    setPref(theme);
    setApplied(applyTheme(theme));
  };

  const menuStyle = {
    "--menu-active-bg": "var(--color-primary)",
    "--menu-active-fg": "var(--color-primary-content)",
  } as CSSProperties;

  return (
    <div
      className={cn(
        "dropdown dropdown-end dropdown-bottom dropdown-open",
        className,
      )}
    >
      {/* 触发器：当前主题色点 + 下拉箭头 */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-label="切换主题"
        className="btn btn-ghost btn-sm rounded-full px-2.5"
      >
        <span
          data-theme={applied}
          aria-hidden
          className="size-3 rounded-full bg-primary ring-1 ring-base-content/40"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
          className="size-3 opacity-60"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
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
        <li className="menu-title">
          <span className="text-base-content/60">选择主题</span>
        </li>

        {/* 跟随系统 */}
        <li>
          <button
            onClick={() => selectTheme("system")}
            className={cn(pref === "system" && "menu-active")}
          >
            <span className="flex w-full items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  aria-hidden
                  className="size-4 opacity-70"
                >
                  <rect x="2.5" y="4" width="19" height="13" rx="2.5" />
                  <path strokeLinecap="round" d="M8.5 21h7M12 17v4" />
                </svg>
                <span>跟随系统</span>
              </span>
              <span className="text-xs opacity-60">
                {applied === "dark" ? "深色" : "浅色"}
              </span>
            </span>
          </button>
        </li>

        {THEMES.map((theme) => (
          <li key={theme}>
            <button
              onClick={() => selectTheme(theme)}
              className={cn(pref === theme && "menu-active")}
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span
                  data-theme={theme}
                  aria-hidden
                  className="pointer-events-none size-3 shrink-0 rounded-full bg-primary"
                />
                <span className="min-w-0 truncate capitalize">{theme}</span>
              </span>
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
  apply(); // 纠正 theme-change 在加载时可能误设的 data-theme="system"
  return () => mq.removeEventListener("change", apply);
}
