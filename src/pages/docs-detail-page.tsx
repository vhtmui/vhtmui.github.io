import { useEffect } from "react";
import { Link, useLoaderData } from "react-router";
import PageHeader from "@/components/custom/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/links";
import { readDocSource } from "@/lib/content.server";
import { renderMarkdown } from "@/lib/markdown.server";
import type { TocItem } from "@/lib/markdown.server";

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

/** 章节导航：锚点 id 由构建期写到标题上，这里只负责列出来 */
function TocNav({ toc }: { toc: TocItem[] }) {
  if (toc.length === 0) return null;

  /**
   * 自己滚而不是交给浏览器跟 hash：SPA 的滚动恢复会把位置拉回顶部，
   * 用 replaceState 更新地址栏但不触发导航，顺带保留可分享的 #锚点。
   */
  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav aria-label="章节导航" className="flex flex-col gap-1 text-sm">
      {toc.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(event) => {
            event.preventDefault();
            jumpTo(item.id);
          }}
          className="rounded-sm py-0.5 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          style={{ paddingInlineStart: `${(item.level - 2) * 0.75}rem` }}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}

/**
 * 文档正文页。
 *
 * 正文用 dangerouslySetInnerHTML 直接铺开构建期渲染好的 HTML：
 * React 水合会跳过这棵子树，所以既不需要在客户端重建 markdown，
 * 也不会出现"服务端一套、客户端重算一套"的闪烁。
 */
export default function DocsDetailPage() {
  const { title, segments, html, toc } = useLoaderData<typeof loader>();

  // 带着 #hash 直接打开时补一次定位（浏览器原生行为可能被滚动恢复抢先）
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <div className="flex flex-col gap-6">
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

      <div className="flex items-start gap-8">
        <article
          className="typeset typeset-docs min-w-0 flex-1"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <aside className="sticky top-20 hidden w-52 shrink-0 xl:block">
          <TocNav toc={toc} />
        </aside>
      </div>
    </div>
  );
}
