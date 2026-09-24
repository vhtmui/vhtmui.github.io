import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 滚动方向：up 内容上移（说明页从下方滚入，默认）/ down 内容下移（说明页从上方滚入） */
export type ScrollCardDirection = "up" | "down";

export interface ScrollCardProps {
  /** 标题页正中展示的大字标题，同时作为说明页顶部的小标题 */
  title: ReactNode;
  /** 说明页正文；缺省时说明页只显示小标题 */
  description?: ReactNode;
  /** 滚动方向，默认 up */
  direction?: ScrollCardDirection;
  /** 卡片高度（px），默认 180。走内联样式而不是类名，避免运行时拼 Tailwind 类 */
  height?: number;
  /** 滚动时长（ms），默认 500 */
  duration?: number;
  className?: string;
  /** 叠加在卡片上的内容，例如覆盖整卡的 <Link> / <a>（点击跳转） */
  children?: ReactNode;
}

/**
 * 两个方向各自的「静止 / 滚到位」类名。
 *
 * 内容条高两页，平移一整页（相对自身高度的 50%）正好翻到下一页；
 * down 方向把两页视觉顺序倒过来（flex-col-reverse），所以静止态本身就停在
 * 标题页上，hover 时再滚回 0，说明页便是从上方压下来的。
 */
const SHIFT = {
  up: {
    rest: "translate-y-0",
    active: "group-hover:-translate-y-1/2 group-focus-within:-translate-y-1/2",
  },
  down: {
    rest: "-translate-y-1/2",
    active: "group-hover:translate-y-0 group-focus-within:translate-y-0",
  },
} as const;

/** 单页：铺满一个视口高，内容居中 */
const PAGE =
  "flex h-1/2 w-full shrink-0 flex-col items-center justify-center gap-1 px-6 text-center";

/**
 * 滚动卡片：默认停在标题页，hover / 聚焦时整条内容平移一页——
 * 说明页滚入的同时标题页滚出，页与页之间没有间隙、间距恒定，
 * 看起来是同一张长页在上下滚动，而不是两张卡各自进出。
 *
 * `direction="down"` 改为说明页从上方滚入（内容下移）；
 * 高度、时长分别由 `height`（px）/ `duration`（ms）控制。
 * 自身不含背景色，是透明卡片；把 <Link> / <a> 作为 children 传进来即可整卡跳转。
 */
export default function ScrollCard({
  title,
  description,
  direction = "up",
  height = 180,
  duration = 500,
  className,
  children,
}: ScrollCardProps) {
  const shift = SHIFT[direction];

  return (
    <div
      className={cn(
        "group relative w-full max-w-[320px] select-none overflow-hidden",
        className,
      )}
      style={{ height }}
    >
      <div
        className={cn(
          "flex h-[200%] w-full flex-col transition-[translate] ease-out motion-reduce:transition-none",
          direction === "down" && "flex-col-reverse",
          shift.rest,
          shift.active,
        )}
        style={{ transitionDuration: `${duration}ms` }}
      >
        {/* 标题页 */}
        <div className={PAGE}>
          <span className="text-3xl font-semibold tracking-tight">{title}</span>
        </div>
        {/* 说明页：小标题 + 说明 */}
        <div className={PAGE}>
          <span className="text-sm font-medium tracking-tight">{title}</span>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}
