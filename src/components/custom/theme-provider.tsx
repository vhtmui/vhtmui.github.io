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
 * - 首屏防闪烁由 root.tsx 的内联脚本负责，这里负责挂载后的同步。
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
  // 首帧固定用 defaultTheme：服务端读不到 localStorage，客户端首帧必须与之一致才不会水合失败；
  // 真实偏好等挂载后再同步，观感由内联脚本先行处理。
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) setThemeState(stored);
  }, [storageKey]);

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
