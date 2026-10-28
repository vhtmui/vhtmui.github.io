import { useEffect, useState, type RefObject } from "react";
import type { TocItem } from "@/lib/markdown.server";

/**
 * 判定线（px，视口顶部往下）：sticky 那块（顶栏 + 面包屑 ≈88px）之下、
 * 锚点留白 6.5rem（104px）再往下一点，这样从章节导航跳过去之后，落点标题正好算作"当前"。
 */
const ACTIVE_LINE = 120;

/**
 * 视口上边界（px）：顶栏 + 面包屑 ≈88px。藏在这条线后面的内容不算"在当前视口内"，
 * 否则刚滚过去的那一节会一直挂着高亮。
 */
const VIEW_TOP = 96;

/**
 * 阅读位置：当前最细标题的 id + 视口内见过的标题 + 阅读进度（0–100）。
 *
 * 一个 rAF 节流的滚动监听把三件事一起算出来：本来就在量同一批节点的位置，
 * 分成几个监听只会让每帧多读几次布局。
 *
 * @param items 构建期收集的目录（文档顺序）
 * @param articleRef 正文元素，用来算进度
 */
export function useDocReading(
  items: TocItem[],
  articleRef: RefObject<HTMLElement | null>,
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  /** 视口内还有正文的标题（文档顺序）：章节导航据此同时高亮多节 */
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const bottom = window.innerHeight;

      /** 每个标题当前的视口位置；没渲染出来的留 null */
      const tops = items.map((item) => {
        const el = document.getElementById(item.id);
        return el ? el.getBoundingClientRect().top : null;
      });

      // 从上往下找最后一个越过判定线的标题，它就是"当前位置最细的标题"
      let current: string | null = null;
      // 一节的范围是「本节标题 → 下一个同级或更浅的标题」，这段和视口有交集就算在视口内
      const visible: string[] = [];

      for (let i = 0; i < items.length; i += 1) {
        const top = tops[i];
        if (top === null) continue;
        if (top <= ACTIVE_LINE) current = items[i].id;

        let end = Number.POSITIVE_INFINITY;
        for (let j = i + 1; j < items.length; j += 1) {
          if (items[j].level <= items[i].level) {
            end = tops[j] ?? Number.POSITIVE_INFINITY;
            break;
          }
        }

        if (top < bottom && end > VIEW_TOP) visible.push(items[i].id);
      }

      setActiveId(current);
      // 内容不变就别换引用：滚动时每帧都会算，false 分支不该触发重渲染
      setVisibleIds((prev) =>
        prev.length === visible.length && prev.every((id, index) => id === visible[index])
          ? prev
          : visible,
      );

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

  return { activeId, visibleIds, progress };
}
