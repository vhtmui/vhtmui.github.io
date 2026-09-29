import { Link } from "react-router";
import PageHeader from "@/components/custom/page-header";
import { DOC_GROUPS } from "@/lib/content";

/**
 * 文档目录页：按 content/ 的分类把文档列出来。
 * 详情见 docs-detail-page.tsx（挂在 `docs/*` 上）。
 */
export default function DocsPage() {
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
