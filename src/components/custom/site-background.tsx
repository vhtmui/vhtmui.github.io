import DotGrid from "@/components/DotGrid";
import { useTheme } from "@/hooks/use-theme";

/**
 * 站点背景：DotGrid 的点阵 —— 指针靠近时点会渐变到高亮色，
 * 快速划过或点击时，范围内的点会被弹开再弹回（InertiaPlugin 的惯性 + 弹性回位）。
 *
 * 两套配色按主题切换。组件的 baseColor / activeColor 只解析 `#rrggbb`（内部走 hexToRgb），
 * 所以这里只能给十六进制，不能用 rgba/oklch：
 * 浅色沿用你给的浅灰底 + 紫色高亮，深色换成暗灰底 + 亮紫，保证两边对比度接近。
 *
 * 这一层不接收指针事件，DotGrid 的交互是它自己在 window 上监听 mousemove / click 做的。
 */
const DOT_GRID_COLORS = {
  light: { baseColor: "#d4d4d8", activeColor: "#7c3aed" },
  dark: { baseColor: "#3f3f46", activeColor: "#a78bfa" },
} as const;

export default function SiteBackground() {
  const { resolvedTheme } = useTheme();
  const { baseColor, activeColor } = DOT_GRID_COLORS[resolvedTheme];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <DotGrid
        dotSize={3}
        gap={15}
        baseColor={baseColor}
        activeColor={activeColor}
        proximity={120}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
      />
    </div>
  );
}
