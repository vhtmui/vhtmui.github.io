import { useEffect, useState } from "react";

/**
 * 监听一条 CSS media query 是否匹配，并随窗口大小变化实时更新。
 * @example const isWide = useMediaQuery("(min-width: 640px)")
 */
export function useMediaQuery(query: string) {
  // 首帧固定 false：服务端没有 matchMedia，客户端水合首帧必须与之一致，
  // 否则布局分支不同会直接触发 hydration 失败；真实值等 effect 里再同步。
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
