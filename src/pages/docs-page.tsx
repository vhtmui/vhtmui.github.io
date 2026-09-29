import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, useParams } from "react-router";
import PageHeader from "@/components/custom/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/links";
import { DOC_GROUPS, findDoc, type DocEntry } from "@/lib/content";

/** 目录页：按 content/ 的分类把文档列出来 */
function DocIndex() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Docs"
        description="路由与 content/ 的目录结构一一对应，丢进来的 markdown 会自动出现在这里。"
      />

      {DOC_GROUPS.map((group) => (
        <section key={group.name} className="flex flex-col gap-2">
          <h2 className="font-heading text-sm font-medium text-muted-foreground">
            {group.name || "未分类"}
          </h2>
          <ul className="flex flex-col gap-2">
            {group.docs.map((doc) => (
              <li key={doc.path}>
                <Link
                  to={doc.path}
                  className="flex items-baseline justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="font-medium">{doc.title}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {doc.segments.join("/")}.md
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** 正文页 */
function DocDetail({ doc }: { doc: DocEntry }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={doc.title} description={doc.segments.join(" / ")}>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to={ROUTES.docs} />}
        >
          返回目录
        </Button>
      </PageHeader>

      <article className="typeset typeset-docs max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.body}</ReactMarkdown>
      </article>
    </div>
  );
}

/** 路径对不上任何文件时的兜底 */
function DocNotFound({ splat }: { splat: string }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="没有这篇文档" description={`content/${splat}.md`} />
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardContent className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
          <p>对应文件不存在，检查一下路径或文件名。</p>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to={ROUTES.docs} />}
          >
            回到文档目录
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 文档页：列表和详情共用这一个组件。
 *
 * `/docs` 没有通配参数，展示目录；`/docs/分类/文件名` 由 `/docs/*` 路由接住，
 * 通配参数就是 content/ 下的相对路径，页面据此查出对应的 markdown 渲染。
 */
export default function DocsPage() {
  const splat = useParams()["*"] ?? "";

  if (!splat) return <DocIndex />;

  const doc = findDoc(splat);
  return doc ? <DocDetail doc={doc} /> : <DocNotFound splat={splat} />;
}
