import { useCallback, useEffect, useState } from "react";
import { ArrowUpFromLine } from "lucide-react";
import { cn } from "@/lib/utils";

/** 滚过这么远才把悬浮操作露出来：刚进页面时不打扰 */
const SHOW_AFTER = 400;

/**
 * docs 右下角的悬浮操作区。
 *
 * 眼下只有「返回顶部」，但它是按「一列操作」搭的（flex-col + gap）：之后要做成
 * 移动端可展开的 dock 时，只需往这列里加项、再给一个展开态和触发器，定位、
 * 显隐、无障碍处理都不用重写。
 *
 * 用 fixed 而不是跟正文同列：它要一直待在视口右下角，不参与 docs 三栏的宽度计算。
 *
 * 外观：平时只是一枚图标，不铺底。hover / 键盘聚焦时从圆的底边顶出一块底色
 * （bg-muted，与顶栏 HeaderNav 的悬停色块同色），按住再轻微回缩。
 */
export default function DocsDock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      setVisible(window.scrollY > SHOW_AFTER);
    };
    // 滚动时每帧只量一次：这里只需要一个布尔值，值没变时 React 会跳过重渲染
    const onScroll = () => {
      frame ||= requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const toTop = useCallback(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, []);

  return (
    // 容器只负责定位：本身不接收指针，按钮各自打开（以后堆多个按钮也不会互相挡）
    <div
      data-not-typeset
      className="pointer-events-none fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2 sm:right-6 sm:bottom-5"
    >
      <button
        type="button"
        aria-label="返回顶部"
        title="返回顶部"
        onClick={toTop}
        // 收起来时既不该被 Tab 聚焦，也不该被读屏念到（还在 DOM 里，只是淡出）
        inert={!visible}
        className={cn(
          // 静态时只是一枚图标：没有底色、没有边框、没有投影
          "group pointer-events-auto relative grid size-11 cursor-pointer place-items-center rounded-full text-muted-foreground",
          "transition-[opacity,translate,color] duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          "hover:text-foreground active:scale-90",
          "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        {/*
          hover 时从圆的底边中点撑开一块底色（与顶栏 HeaderNav 的悬停色块同一个
          bg-muted）。origin-bottom 落在 50% 100%，缩放起点正是那个点；用 scale
          而不是改宽高：不触发重排，圆角也跟着一起缩放，长出来还是正圆。
          色块挂在这里、图标再压一层：按钮自身的 translate 只负责显隐，互不干扰。
        */}
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-bottom scale-0 rounded-full bg-muted transition-transform duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-100 motion-reduce:transition-none"
        />
        <ArrowUpFromLine aria-hidden="true" className="relative size-7" />
      </button>
    </div>
  );
}
