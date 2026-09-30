import { useEffect, useRef } from "react";
import WakeSlider from "@/components/WakeSlider";
import { cn } from "@/lib/utils";

/** 指针移动超过这个距离就不算"点击"，避免想拖动时误开合章节导航 */
const CLICK_SLOP = 6;

/**
 * 页面底部中间的阅读进度条：纯展示（进度由正文滚动位置驱动），
 * 点一下开合章节导航。
 *
 * 拖动之所以不生效：进度是受控的，WakeSlider 内部只更新自己的取值，
 * 声音/波纹动画由外部传入的 value 驱动，所以拖了也不会跑偏。
 * 指针被 WakeSlider 的轨道捕获，pointerup 不会冒泡回来，所以监听 window 判定点击。
 */
export default function ReadingProgress({
  value,
  onToggle,
}: {
  /** 0–100 */
  value: number;
  onToggle: () => void;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onUp = (event: PointerEvent) => {
      const from = start.current;
      start.current = null;
      if (!from) return;
      const moved = Math.hypot(event.clientX - from.x, event.clientY - from.y);
      if (moved <= CLICK_SLOP) onToggle();
    };

    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, [onToggle]);

  return (
    <div
      // 进度条在 main.typeset 里，标出来免得吃正文的字号/下划线等排版规则
      data-not-typeset
      onPointerDown={(event) => {
        start.current = { x: event.clientX, y: event.clientY };
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onToggle();
      }}
      // text 色给到 currentColor：WakeSlider 的轨道用它取色，保持原来那层灰白底色；
      // 进度填充单独走主题色 primary（见下面的 fillColor）。不加底色、压到十几像素高、
      // 只靠两端渐变遮罩（mask）淡出，条子直接融进页面背景；压过正文也不至于和正文叠成两行。
      // pt 只是把点击区垫到 24px（看不见），条子本身仍贴住视口底边。
      className={cn(
        "fixed bottom-0 left-1/2 z-40 w-[min(88vw,26rem)] -translate-x-1/2 pt-2.5 text-foreground/60",
        "[-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
      )}
    >
      <WakeSlider
        value={value}
        ariaLabel="阅读进度"
        formatValue={(v) => `已读 ${Math.round(v)}%`}
        bars={40}
        height={14}
        restHeight={3}
        gap={2}
        fillColor="var(--primary)"
        // 轨道沿用外面给的灰白 currentColor，稍微加深一点补上少掉的底色，未读部分仍看得出形状
        trackColor="color-mix(in oklab, currentColor 22%, transparent)"
        // 只是进度展示 + 点一下开合导航，不要显示成可拖拽手柄；
        // min-h-0 抵掉轨道自带的 44px 触摸高度，条子才能真的贴在底边上
        className="[&>div]:cursor-pointer [&>div]:min-h-0"
      />
    </div>
  );
}
