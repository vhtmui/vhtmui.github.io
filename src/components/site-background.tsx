import { useTheme } from "@/hooks/use-theme";
import ShapeGrid from "@/components/ShapeGrid";

const GRID_COLORS = {
  light: {
    border: "rgba(24, 24, 27, 0.06)",
    hover: "rgba(24, 24, 27, 0.08)",
  },
  dark: {
    border: "rgba(250, 250, 250, 0.07)",
    hover: "rgba(250, 250, 250, 0.08)",
  },
} as const;

export default function SiteBackground() {
  const { resolvedTheme } = useTheme();
  const grid = GRID_COLORS[resolvedTheme];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <ShapeGrid
        speed={0.5}
        squareSize={40}
        direction="diagonal"
        borderColor={grid.border}
        hoverFillColor={grid.hover}
        shape="square"
        hoverTrailAmount={0}
        fadeColor={null}
      />
    </div>
  );
}
