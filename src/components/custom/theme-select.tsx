import { Monitor, Moon, Sun } from "lucide-react";
import GlideSelect, { type GlideSelectOption } from "@/components/glide-select";
import { useTheme, type Theme } from "@/hooks/use-theme";

/** 主题选项：用 SVG 图标表示，文字仅供读屏 */
const THEME_OPTIONS: GlideSelectOption[] = [
  {
    value: "light",
    label: (
      <>
        <Sun className="size-4 block" />
        <span className="sr-only">浅色</span>
      </>
    ),
  },
  {
    value: "dark",
    label: (
      <>
        <Moon className="size-4 block" />
        <span className="sr-only">深色</span>
      </>
    ),
  },
  {
    value: "system",
    label: (
      <>
        <Monitor className="size-4 block" />
        <span className="sr-only">跟随系统</span>
      </>
    ),
  },
];

/** 主题选择：鼠标悬停或点击均可展开 */
export default function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  return (
    <GlideSelect
      options={THEME_OPTIONS}
      value={theme}
      onChange={(value) => setTheme(value as Theme)}
      ariaLabel="切换主题"
      align="right"
      menuWidth={76}
      openOnHover
      showArrow={false}
      ghost
      closeOnSelect={false}
      surfaceColor="var(--muted)"
      highlightColor="var(--border)"
      textColor="var(--foreground)"
      accentColor="var(--primary)"
    />
  );
}
