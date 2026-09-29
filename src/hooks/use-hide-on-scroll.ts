import { useEffect, type RefObject } from "react";

/**
 * 顶部那块（顶栏 + 面包屑）随滚动收起 / 露出。
 *
 * 位移量跟滚动距离一一对应：往下滚多少就往上让多少（滚多少走多少），
 * 往上滚多少就露多少；回到页面顶部一定完全露出。也就是说，滚动方向反过来时，
 * 整块会把刚才"欠下"的位移原样还回来 —— 不是单纯按阈值切换显隐，所以在深度
 * 滚动处往回滚也能立刻看到。
 *
 * 位移每帧直接写 transform：页面的滚动本身是逐帧的，跟着同样的距离走
 * 才是"同步"；如果再加过渡，反而会比页面慢半拍、看起来像浮在上面。
 *
 * @param ref 装着顶栏与面包屑的容器
 * @param keepRef 不许移出视口的那一块（面包屑）。容器最多上移到它贴住视口上边界
 *   为止，之后"欠账"封顶，所以再往回滚一定立刻开始露出。不传则整块都能推出视口。
 */
export function useHideOnScroll<T extends HTMLElement>(
  ref: RefObject<T | null>,
  keepRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /** 上一次的滚动位置，用来算这一帧滚了多少 */
    let lastY = window.scrollY;
    /** 当前位移（负数，0 表示完全露出） */
    let offset = 0;
    let frame = 0;

    const sync = () => {
      frame = 0;
      const y = window.scrollY;

      // keep 元素在容器里的位置就是"最多能藏多少"：它贴到视口上边界时到位。
      // offsetTop 相对的是定位祖先 —— 容器本身是 sticky，所以正好是这一块。
      // keep 收起不渲染时退回整块高度，也就是照旧全部藏起来。
      const keep = keepRef?.current;
      const limit = keep ? keep.offsetTop : el.offsetHeight;

      // 往下滚 y 变大 → offset 变小（往上藏）；往上滚则原样还回来
      offset = Math.min(0, Math.max(-limit, offset - (y - lastY)));
      lastY = y;
      // 到顶必然完全露出（锚点跳转、回顶、橡皮筋回弹都走这条路）
      if (y <= 0) offset = 0;

      el.style.transform = offset === 0 ? "" : `translate3d(0, ${offset}px, 0)`;
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(sync);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [ref, keepRef]);
}
