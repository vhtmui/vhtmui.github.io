import { Suspense, lazy } from "react";
import { useTheme } from "@/hooks/use-theme";

// ogl 体积不小，单独拆包，首屏不阻塞
const Particles = lazy(() => import("@/components/Particles"));

const PARTICLE_COLORS = {
  light: ["#0f172a", "#64748b"],
  dark: ["#ffffff", "#a1a1aa"],
} as const;

/**
 * 全站固定背景：位于所有内容之下，不拦截鼠标事件。
 * 页面容器保持透明即可看到它，内容块用半透明背景（bg-card/60）避免遮挡。
 */
export default function SiteBackground() {
  const { resolvedTheme } = useTheme();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Suspense fallback={null}>
        <Particles
          key={resolvedTheme}
          className="h-full w-full"
          particleCount={220}
          particleSpread={10}
          speed={0.08}
          particleColors={[...PARTICLE_COLORS[resolvedTheme]]}
          particleBaseSize={90}
          sizeRandomness={1}
          alphaParticles
          moveParticlesOnHover
          particleHoverFactor={1.2}
        />
      </Suspense>
    </div>
  );
}
