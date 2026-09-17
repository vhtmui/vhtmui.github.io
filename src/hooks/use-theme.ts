import { createContext, useContext } from "react";

/** 用户偏好：浅色 / 深色 / 跟随系统 */
export type Theme = "dark" | "light" | "system";

export type ThemeProviderState = {
  /** 用户选择的偏好 */
  theme: Theme;
  /** 实际生效的主题（system 已解析为 light / dark） */
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
};

export const ThemeProviderContext = createContext<ThemeProviderState | null>(
  null,
);

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme 必须在 <ThemeProvider> 内部使用");
  }
  return context;
}
