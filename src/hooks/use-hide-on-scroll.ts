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
 * @param ref 装着顶栏与面包屑的容器。上移上限取它第一个子元素（顶栏）的高度：
 *   顶栏整条让出视口后面包屑正好停在视口顶，之后"欠账"封顶，所以再往回滚
 *   一定立刻开始露出。
 */
export function useHideOnScroll<T extends HTMLElement>(ref: RefObject<T | null>) {
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

      // 上移上限 = 顶栏（容器第一个子元素）的高度，也就是"最多能藏多少"：
      // 顶栏移出视口后，下面的面包屑正好停在视口顶。容器为空时退回整块高度。
      const top = el.firstElementChild as HTMLElement | null;
      const limit = top ? top.offsetHeight : el.offsetHeight;

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
  }, [ref]);
}
