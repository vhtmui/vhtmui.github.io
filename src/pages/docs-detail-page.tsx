import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, useParams } from "react-router";
import PageHeader from "@/components/custom/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/links";
import { findDoc, type DocEntry } from "@/lib/content";

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
 * 文档正文页：`/docs/*` 的通配参数就是 content/ 下的相对路径。
 *
 * 目前仍是从客户端索引里查内容（`@/lib/content` 用 import.meta.glob 收集），
 * 下一步会改成 loader 在构建期读文件、渲染成 HTML。
 */
export default function DocsDetailPage() {
  const splat = useParams()["*"] ?? "";
  const doc = findDoc(splat);

  return doc ? <DocDetail doc={doc} /> : <DocNotFound splat={splat} />;
}
