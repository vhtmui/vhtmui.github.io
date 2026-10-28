import { useEffect, useRef } from "react";

/** 指针移动超过这个距离就不算"点击"，避免想滚动时误开合章节导航 */
const CLICK_SLOP = 6;

/**
 * 页面底部的阅读进度条：贴住视口底边的一条窄条，进度由正文滚动位置驱动，
 * 样式参考常见的顶部加载条 —— 轨道很淡，只有填充的那一截是主题色。
 *
 * 点一下开合章节导航（窄屏的章节导航卡片就是靠它打开的），键盘 Enter / 空格同理。
 * 指针按下到抬起之间如果明显拖动过，就不算点击。
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
      // 进度条在 main.typeset 里，标出来免得吃正文的字号等排版规则
      data-not-typeset
      role="progressbar"
      aria-label="阅读进度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      onPointerDown={(event) => {
        start.current = { x: event.clientX, y: event.clientY };
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onToggle();
      }}
      /*
        只有贴底那 2px 是看得见的条子，外面这 8px 高的一圈是点击热区：
        够点得到，又不至于挡住正文最下面的一行。整条铺满视口宽度。
      */
      className="fixed inset-x-0 bottom-0 z-40 h-2.5 cursor-pointer"
    >
      <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-foreground/10">
        {/*
          宽度直接跟随滚动位置：进度条是"跟着页面走"的指示器，加一点过渡是为了
          滚动停止时收尾平滑；幅度很小，不会比正文慢半拍。
        */}
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out motion-reduce:transition-none"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
