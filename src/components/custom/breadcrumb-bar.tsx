import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { gsap } from "gsap";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SplitText, { type SplitTextProps } from "@/components/split-text";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ROUTES } from "@/config/links";
import { cn } from "@/lib/utils";

/** 面包屑逐字动画参数（进/出节奏一致） */
const BREADCRUMB_SPLIT = {
  tag: "span",
  textAlign: "left",
  delay: 20,
  duration: 0.45,
  ease: "power3.out",
  from: { opacity: 0, y: -10 },
  to: { opacity: 1, y: 0 },
  threshold: 0,
  rootMargin: "0px",
} satisfies Partial<SplitTextProps>;

/** 面包屑展开 / 收起耗时 */
const BREADCRUMB_COLLAPSE_MS = 320;

/** 面包屑：宽屏且非首页时出现，逐字进入 / 抬起折叠消失，不显示时不占空间 */
export default function BreadcrumbBar() {
  const { pathname } = useLocation();
  const isWide = useMediaQuery("(min-width: 640px)");
  /** 仅宽屏且非首页显示 */
  const visible = isWide && pathname !== ROUTES.home;
  const segments = pathname.split("/").filter(Boolean);

  const [mounted, setMounted] = useState(visible);
  const [expanded, setExpanded] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // 收起动画被打断时，把字符复位（否则会停在透明状态）
      const chars = bodyRef.current?.querySelectorAll(".split-char");
      if (chars?.length) {
        gsap.killTweensOf(chars);
        gsap.set(chars, { clearProps: "opacity,transform" });
      }
      // 下一帧再展开，保证折叠动画从 0fr 起步
      const frame = requestAnimationFrame(() => setExpanded(true));
      return () => cancelAnimationFrame(frame);
    }

    // 收起：字符逐字向上消失，容器同时向上折叠，折叠完成后卸载（不占空间）
    const chars = bodyRef.current?.querySelectorAll(".split-char");
    if (chars?.length) {
      gsap.to(chars, {
        opacity: 0,
        y: -10,
        duration: 0.24,
        ease: "power2.in",
        stagger: 0.012,
        overwrite: true,
      });
    }
    setExpanded(false);
    const timer = setTimeout(
      () => setMounted(false),
      BREADCRUMB_COLLAPSE_MS,
    );
    return () => clearTimeout(timer);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-linear",
        expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div ref={bodyRef} className="min-h-0">
        <div className="mx-auto w-full max-w-5xl px-4 pb-2">
          <Breadcrumb>
            <BreadcrumbList>
              {segments.map((segment, index) => {
                const to = ">" + segments.slice(0, index + 1).join(">");
                const isLast = index === segments.length - 1;
                return (
                  <Fragment key={to}>
                    {/* 首项前同样保留分隔符 */}
                    <BreadcrumbSeparator>
                      <SplitText
                        {...BREADCRUMB_SPLIT}
                        key={`sep-${index}-${pathname}`}
                        text=">"
                        className="select-none text-muted-foreground/50"
                      />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>
                          <SplitText
                            {...BREADCRUMB_SPLIT}
                            key={`item-${to}`}
                            text={segment}
                          />
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink render={<Link to={to} />}>
                          <SplitText
                            {...BREADCRUMB_SPLIT}
                            key={`item-${to}`}
                            text={segment}
                          />
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </div>
  );
}
