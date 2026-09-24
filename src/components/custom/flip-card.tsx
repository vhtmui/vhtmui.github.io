import { useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 翻转触发方式 */
export type FlipCardTrigger = "hover" | "click";

/** 翻转方向：horizontal 左右翻（绕 Y 轴）/ vertical 上下翻（绕 X 轴） */
export type FlipCardDirection = "horizontal" | "vertical";

export interface FlipCardProps {
  /** 正面：居中大字标题 */
  title: ReactNode;
  /** 背面说明：翻转后标题缩到左上角，说明居中 */
  description?: ReactNode;
  /** hover 悬停翻转（默认）/ click 点击或聚焦翻转 */
  trigger?: FlipCardTrigger;
  /** 翻转方向，默认 horizontal（左右翻）；vertical 为上下翻 */
  direction?: FlipCardDirection;
  /** 翻转时长（ms） */
  duration?: number;
  className?: string;
  /** 叠加在卡片上的内容，例如覆盖整卡的 <Link> / <a>（点击跳转） */
  children?: ReactNode;
}

/** 两面共用：铺满、隐藏背面、无背景的透明卡片 */
const FACE =
  "absolute inset-0 rounded-[25px] [backface-visibility:hidden] transform-3d";

/**
 * 两个方向对应的完整类名（写全字面量，Tailwind 才能扫描到）：
 * horizontal 绕 Y 轴左右翻，vertical 绕 X 轴上下翻。
 */
const FLIP = {
  horizontal: {
    rest: "transform-[rotateY(0deg)]",
    turned: "transform-[rotateY(180deg)]",
    hover:
      "group-hover:transform-[rotateY(180deg)] group-focus-within:transform-[rotateY(180deg)]",
    back: "transform-[rotateY(180deg)]",
  },
  vertical: {
    rest: "transform-[rotateX(0deg)]",
    turned: "transform-[rotateX(180deg)]",
    hover:
      "group-hover:transform-[rotateX(180deg)] group-focus-within:transform-[rotateX(180deg)]",
    back: "transform-[rotateX(180deg)]",
  },
} as const;

/**
 * 翻转卡片：正面大字标题，翻转后标题退到左上角、中间显示说明。
 *
 * 默认 hover 翻转（含键盘 focus-within）；`trigger="click"` 改为点击 / 回车切换。
 * `direction` 控制翻转轴：horizontal 左右翻（默认）、vertical 上下翻。
 * 自身不含背景色，是透明卡片；把 <Link> / <a> 作为 children 传进来即可整卡跳转。
 */
export default function FlipCard({
  title,
  description,
  trigger = "hover",
  direction = "horizontal",
  duration = 500,
  className,
  children,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const clickMode = trigger === "click";
  const flip = FLIP[direction];

  const toggle = () => setFlipped((value) => !value);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggle();
  };

  return (
    <div
      className={cn(
        "group relative h-[180px] w-full max-w-[320px] select-none perspective-[1000px]",
        className,
      )}
      role={clickMode ? "button" : undefined}
      tabIndex={clickMode ? 0 : undefined}
      aria-pressed={clickMode ? flipped : undefined}
      onClick={clickMode ? toggle : undefined}
      onKeyDown={clickMode ? onKeyDown : undefined}
    >
      <div
        className={cn(
          "relative h-full w-full transition-transform ease-[cubic-bezier(0.5,1,0.89,1)] transform-3d motion-reduce:transition-none",
          clickMode ? (flipped ? flip.turned : flip.rest) : flip.hover,
        )}
        style={{ transitionDuration: `${duration}ms` }}
      >
        {/* 正面：大字标题 */}
        <div className={cn(FACE, "grid place-items-center px-4 text-center")}>
          <span className="text-3xl font-semibold tracking-tight">
            {title}
          </span>
        </div>
        {/* 背面：标题靠左上角，说明居中 */}
        <div className={cn(FACE, flip.back)}>
          <span className="absolute top-6 left-8 text-sm font-medium text-foreground">
            {title}
          </span>
          {description ? (
            <div className="grid h-full w-full place-items-center px-6 text-center text-sm text-foreground">
              {description}
            </div>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}
