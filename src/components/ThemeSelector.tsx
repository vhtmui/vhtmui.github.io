import { cn } from "../utils";

const THEMES = [
  "system",
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

function applySystemTheme() {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  document.documentElement.setAttribute(
    "data-theme",
    mq.matches ? "dark" : "light",
  );
}

function getInitialTheme(): string {
  const saved = localStorage.getItem(THEME_KEY);
  return saved;
}

export function systemThemeChange() {
  // 主题跟随系统：仅在当前选中的是 system 时生效
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    if (localStorage.getItem(THEME_KEY) === "system") applySystemTheme();
  };
  mq.addEventListener("change", apply);
  apply(); // 纠正 theme-change 在加载时可能误设的 data-theme="system"
  return () => mq.removeEventListener("change", apply);
}

export default function ThemeSelector({ className }: { className?: string }) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "system") {
      applySystemTheme();
    } else {
      // 由 theme-change 处理
    }
  };

  return (
    <div className={cn(className)}>
      <div className="dropdown dropdown-open dropdown-left dropdown-bottom">
        <div tabIndex={0} role="button" className="btn m-1">
          Hover
        </div>
        <div className="dropdown-content bg-base-200 max-h-[50vh] rounded-xs overflow-y-auto overflow-x-hidden p-2">
          <ul tabIndex={-1} className="menu">
            {THEMES.map((theme) => (
              <li>
                <button className="btn btn-ghost" data-set-theme={theme}>
                  {theme}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
