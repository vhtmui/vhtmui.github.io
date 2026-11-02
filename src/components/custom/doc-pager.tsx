import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { hideSlidePill } from "@/lib/slide-pill";
import { cn } from "@/lib/utils";

export interface DocPagerItem {
  title: string;
  /** 站内路由路径，例如 /docs/其他/Rust */
  path: string;
}

/**
 * 底色块：与顶栏 HeaderNav 那块滑动药丸同一套（bg-muted、220ms、同一条缓动）。
 * 绝对定位在卡片下面，只负责"滑过去"这件事。
 */
const PILL =
  "pointer-events-none absolute top-0 left-0 z-0 rounded-lg bg-muted opacity-0 transition-[transform,width,height,opacity] duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none";

/**
 * 卡片本体：纯文字，没有底色、边框、投影 —— 悬停的底色交给上面的滑块。
 * focus 时直接铺一块同色底：键盘用户没有"悬停"，滑块那套跟不过去。
 */
const CARD =
  "relative z-1 flex min-w-0 flex-col gap-0.5 rounded-lg px-3 py-2.5 no-underline outline-none transition-colors focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * 文档末尾的「上一篇 / 下一篇」。
 *
 * 位置由调用方决定：正文与脚注的分割线之间（没有脚注时就在正文末尾），见
 * docs-detail-page 与 markdown.server 的 splitFootnotes。
 *
 * 两张卡片并排、等宽。悬停时底色滑块滑到那张卡片上，指针离开就收回 ——
 * 与左侧目录树、顶栏导航同一套手感（同样是 hideSlidePill 收尾，避免残留的
 * 绝对定位盒子撑出滚动条）。
 */
export default function DocPager({
  prev,
  next,
}: {
  prev: DocPagerItem | null;
  next: DocPagerItem | null;
}) {
  const navRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const prevRef = useRef<HTMLAnchorElement | null>(null);
  const nextRef = useRef<HTMLAnchorElement | null>(null);
  const [hovered, setHovered] = useState<"prev" | "next" | null>(null);

  const placePill = useCallback(() => {
    const pill = pillRef.current;
    const nav = navRef.current;
    if (!pill || !nav) return;

    const card = hovered === "prev" ? prevRef.current : hovered === "next" ? nextRef.current : null;
    if (!card) {
      hideSlidePill(pill);
      return;
    }

    const navBox = nav.getBoundingClientRect();
    const cardBox = card.getBoundingClientRect();

    pill.style.opacity = "1";
    pill.style.width = `${cardBox.width}px`;
    pill.style.height = `${cardBox.height}px`;
    pill.style.transform = `translate(${cardBox.left - navBox.left}px, ${
      cardBox.top - navBox.top
    }px)`;
  }, [hovered]);

  useLayoutEffect(() => {
    placePill();
  }, [placePill]);

  // 换行、字体晚到、窗口变宽变窄都会改卡片尺寸：滑块跟着重新对位
  useEffect(() => {
    window.addEventListener("resize", placePill);
    document.fonts.ready.then(placePill).catch(() => {});
    return () => window.removeEventListener("resize", placePill);
  }, [placePill]);

  if (!prev && !next) return null;

  return (
    /*
      data-not-typeset：这一块在 main 的 .typeset 里，但它是界面而不是正文，
      不能让 typeset 的链接下划线、段落间距套上来。
    */
    <nav
      ref={navRef}
      data-not-typeset
      aria-label="上一篇 / 下一篇"
      onPointerLeave={() => setHovered(null)}
      // 手机上竖排：420px 一屏放两栏，标题只剩十来个字，截断得太狠
      className="relative grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      <span ref={pillRef} aria-hidden="true" className={PILL} />

      {prev ? (
        <Link
          ref={prevRef}
          to={prev.path}
          aria-label={`上一篇：${prev.title}`}
          onPointerEnter={(event) => event.pointerType === "mouse" && setHovered("prev")}
          className={cn(CARD, "items-start text-left sm:col-start-1")}
        >
          <span className="text-xs text-muted-foreground">上一篇</span>
          <span className="w-full truncate text-sm font-medium text-foreground">{prev.title}</span>
        </Link>
      ) : null}

      {next ? (
        <Link
          ref={nextRef}
          to={next.path}
          aria-label={`下一篇：${next.title}`}
          onPointerEnter={(event) => event.pointerType === "mouse" && setHovered("next")}
          className={cn(CARD, "items-end text-right sm:col-start-2")}
        >
          <span className="text-xs text-muted-foreground">下一篇</span>
          <span className="w-full truncate text-sm font-medium text-foreground">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
