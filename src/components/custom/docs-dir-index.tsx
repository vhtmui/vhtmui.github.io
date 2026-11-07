import { Link } from "react-router";
import DocNodeList from "@/components/custom/doc-node-list";
import PageHeader from "@/components/custom/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/links";
import type { DocDirSource } from "@/lib/content.server";
import { countDocs } from "@/lib/doc-tree";

/**
 * 目录页：`/docs/books`、`/docs/books/代码整洁之道` 这类「由目录名产生的 URL」
 * 都落到这里，把这一层的子目录与文档按层级列成链接。
 *
 * 之前这些路径只当作文档去读，目录没有 .md 就直接 404；现在目录本身就是一层页面，
 * 左侧目录树、面包屑、文档清单里的目录链接都能点进来。
 */
export default function DocsDirIndex({ dir }: { dir: DocDirSource }) {
  const { name, segments, children } = dir;
  const total = countDocs(children);

  return (
    /* 与正文页同一栏宽（.docs-column 里的 --docs-article），切换时不跳栏 */
    <div className="docs-column flex min-w-80 flex-col gap-6 px-4 pb-14 sm:px-6 lg:px-8">
      <PageHeader
        title={name}
        description={`${segments.join(" / ")} · 共 ${total} 篇`}
      >
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to={ROUTES.docs} />}
        >
          返回目录
        </Button>
      </PageHeader>

      {children.length ? (
        <DocNodeList nodes={children} />
      ) : (
        <p className="text-sm text-muted-foreground">这个目录下还没有内容。</p>
      )}
    </div>
  );
}
