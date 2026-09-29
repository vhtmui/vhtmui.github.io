import { useCallback, useEffect, useRef, useState } from "react";
import ClipboardJS from "clipboard";
import { X } from "lucide-react";
import { Link, useLoaderData } from "react-router";
import DocToc from "@/components/custom/doc-toc";
import PageHeader from "@/components/custom/page-header";
import ReadingProgress from "@/components/custom/reading-progress";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/links";
import { useDocReading } from "@/hooks/use-doc-reading";
import { readDocSource } from "@/lib/content.server";
import { renderMarkdown } from "@/lib/markdown.server";
import { cn } from "@/lib/utils";

/** 复制代码后对勾停留时长（ms） */
const COPY_FEEDBACK = 1200;

/**
 * 文档栏：标题区与正文共用一栏，独立居中 —— 最多 48rem（768px）、最少 20rem（320px），
 * 两侧留白随屏宽递增（窄屏不贴屏幕边，宽屏给右侧章节导航留出间隔）。
 *
 * 320px 时靠 min-w 顶到满宽：外层 main 也有 16px 内边距，这一栏会向外溢过它，
 * 正好占满屏幕宽度，正文自己的 padding 仍是 16px，不会顶出屏幕。
 * 章节导航与进度条用 fixed 挂在这一栏里，脱离文档流，不参与这里的宽度计算。
 */
const DOC_COLUMN =
  "mx-auto flex w-full min-w-80 max-w-3xl flex-col gap-6 px-4 pb-14 sm:px-6 lg:px-8";

/**
 * 侧栏导航的落点：正文半宽 24rem + 间隔 2rem，从视口中线往右量。
 * 13rem 宽 + 16px 右边距 = 1280px（xl）刚好放得下，所以断点取 xl：
 * 再窄就装不进正文两侧，改成底部悬浮卡片。
 */
const TOC_ASIDE = "fixed top-20 left-[calc(50%+24rem+2rem)] z-30 hidden w-52";
const TOC_CARD =
  "fixed inset-x-3 bottom-24 z-40 mx-auto flex max-h-[80svh] max-w-md flex-col overflow-hidden rounded-xl border bg-popover/95 shadow-lg backdrop-blur-sm xl:hidden";

/** 把 `/docs/*` 的通配参数拆成路径段（可能带 URL 编码） */
function toSegments(splat: string | undefined) {
  return (splat ?? "")
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
}

/**
 * 构建期把这篇文档渲染成 HTML + 目录。
 *
 * 这里读文件、跑 markdown 渲染，都只发生在预渲染阶段：产物里对应一份
 * `[url].data`（客户端导航时按需取单篇），而客户端代码里没有 markdown 原文，
 * 也没有任何 markdown 解析器。
 */
export async function loader({ params }: { params: Partial<Record<string, string>> }) {
  const segments = toSegments(params["*"]);
  const doc = readDocSource(segments);
  const { html, toc } = await renderMarkdown(doc.content);

  return { title: doc.title, segments: doc.segments, html, toc };
}

/**
 * 文档正文页。
 *
 * 正文用 dangerouslySetInnerHTML 直接铺开构建期渲染好的 HTML：
 * React 水合会跳过这棵子树，所以既不需要在客户端重建 markdown，
 * 也不会出现"服务端一套、客户端重算一套"的闪烁。
 *
 * 章节导航与正文互不占位：正文自己居中，导航在宽屏用 fixed 落在右侧空白里，
 * 窄屏收进底部悬浮卡片，两者共用同一份开合状态（默认值按断点各自解释）。
 */
export default function DocsDetailPage() {
  const { title, segments, html, toc } = useLoaderData<typeof loader>();
  const articleRef = useRef<HTMLElement>(null);
  /** 宽屏默认展开（点进度条收起）、窄屏默认隐藏（点进度条弹出），同一份状态两种解释 */
  const [tocOpen, setTocOpen] = useState(false);
  const toggleToc = useCallback(() => setTocOpen((open) => !open), []);
  const { activeId, progress } = useDocReading(toc, articleRef);

  // 带着 #hash 直接打开时补一次定位（浏览器原生行为可能被滚动恢复抢先）
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, []);

  // 代码块复制：按钮是构建期写好的静态 HTML，这里用事件委托接管，
  // 代码内容从 DOM 现取，不需要在 HTML 里再存一份文本。
  useEffect(() => {
    const clipboard = new ClipboardJS("[data-copy-code]", {
      text: (trigger) => {
        const pre = trigger.closest(".code-block")?.querySelector("pre");
        if (!pre) return "";

        // shiki 把每一行放在 .line 里、行间没有换行文本节点，得自己拼回来
        const lines = pre.querySelectorAll(".line");
        if (lines.length > 0) {
          return [...lines].map((line) => line.textContent ?? "").join("\n");
        }

        return pre.textContent ?? "";
      },
    });

    const timers = new Map<Element, number>();

    clipboard.on("success", (event) => {
      const button = event.trigger;
      button.setAttribute("data-copied", "true");

      const previous = timers.get(button);
      if (previous) window.clearTimeout(previous);

      timers.set(
        button,
        window.setTimeout(() => {
          button.removeAttribute("data-copied");
          timers.delete(button);
        }, COPY_FEEDBACK),
      );
    });

    clipboard.on("error", (event) => {
      console.error("Failed to copy code: ", event.action);
    });

    return () => {
      clipboard.destroy();
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <div className={DOC_COLUMN}>
      <PageHeader title={title} description={segments.join(" / ")}>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to={ROUTES.docs} />}
        >
          返回目录
        </Button>
      </PageHeader>

      <article
        ref={articleRef}
        className="typeset typeset-docs min-w-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/*
        宽屏：导航贴在正文右侧的空白里。fixed 脱离文档流，正文宽度与居中都不受影响；
        导航自己滚动（max-h），长目录不会把整页撑长。
      */}
      <aside
        data-not-typeset
        aria-label="章节导航"
        className={cn(
          TOC_ASIDE,
          "max-h-[calc(100svh-7rem)] overflow-y-auto",
          tocOpen ? "xl:hidden" : "xl:block",
        )}
      >
        <DocToc items={toc} activeId={activeId} />
      </aside>

      {/* 窄屏：装不下正文 + 留白 + 导航，就收进 80svh 的悬浮卡片，默认隐藏 */}
      {tocOpen ? (
        <div
          data-not-typeset
          className={cn(
            TOC_CARD,
            "animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none",
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
            <span className="text-sm font-medium">章节导航</span>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="收起章节导航"
              onClick={toggleToc}
            >
              <X />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <DocToc
              items={toc}
              activeId={activeId}
              onNavigate={() => setTocOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {/* 底部中间的阅读进度条：点一下开合章节导航 */}
      <ReadingProgress value={progress} onToggle={toggleToc} />
    </div>
  );
}
