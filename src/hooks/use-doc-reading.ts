import { useEffect, useState, type RefObject } from "react";
import type { TocItem } from "@/lib/markdown.server";

/**
 * 判定线（px，视口顶部往下）：sticky 那块（顶栏 + 面包屑 ≈88px）之下、
 * 锚点留白 6.5rem（104px）再往下一点，这样从章节导航跳过去之后，落点标题正好算作"当前"。
 */
const ACTIVE_LINE = 120;

/**
 * 阅读位置：当前位置最细标题的 id + 阅读进度（0–100）。
 *
 * 一个 rAF 节流的滚动监听把两件事一起算出来：本来就在量同一批节点的位置，
 * 分成两个监听只会让每帧多一次布局读取。
 *
 * @param items 构建期收集的目录（文档顺序）
 * @param articleRef 正文元素，用来算进度
 */
export function useDocReading(
  items: TocItem[],
  articleRef: RefObject<HTMLElement | null>,
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    let frame = 0;

    const measure = () => {
      frame = 0;

      // 从上往下找最后一个越过判定线的标题，它就是"当前位置最细的标题"
      let current: string | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top > ACTIVE_LINE) break;
        current = item.id;
      }
      setActiveId(current);

      const article = articleRef.current;
      if (!article) return;
      // 进度以正文为单位：滚过正文的可滚动部分刚好是 100%。
      // 取整既对齐进度条的 step，也把"每帧都 setState"降成每 1% 一次。
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      setProgress(
        total > 0 ? Math.min(100, Math.max(0, Math.round((-rect.top / total) * 100))) : 100,
      );
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items, articleRef]);

  return { activeId, progress };
}
