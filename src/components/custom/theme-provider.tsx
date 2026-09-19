import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { ThemeProviderContext, type Theme } from "@/hooks/use-theme";

const MEDIA_QUERY = "(prefers-color-scheme: dark)";

function subscribeSystemTheme(onChange: () => void) {
  const mq = window.matchMedia(MEDIA_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * 用 `.dark` 类驱动 shadcn 的明暗主题：
 * - 偏好与解析结果都放在 context 里，组件通过 useTheme() 读取；
 * - 系统偏好变化时（system 模式）自动跟随；
 * - index.html 的内联脚本负责首屏避免闪烁，这里负责后续同步。
 */
export default function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme | null) ?? defaultTheme,
  );

  const systemPrefersDark = useSyncExternalStore(
    subscribeSystemTheme,
    () => window.matchMedia(MEDIA_QUERY).matches,
    () => false,
  );

  const resolvedTheme: "dark" | "light" =
    theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = (next: Theme) => {
    localStorage.setItem(storageKey, next);
    setThemeState(next);
  };

  return (
    <ThemeProviderContext value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeProviderContext>
  );
}
