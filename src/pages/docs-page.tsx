import { Link, useLoaderData } from "react-router";
import PageHeader from "@/components/custom/page-header";
import { listDocGroups } from "@/lib/content.server";

/**
 * 目录页的数据：只有元信息（分组 / 标题 / 路径），
 * 正文不进 loader 返回值，否则会被序列化进 HTML。
 */
export function loader() {
  return { groups: listDocGroups() };
}

/** 文档目录页：按 content/ 的分类把文档列出来 */
export default function DocsPage() {
  const { groups } = useLoaderData<typeof loader>();

  return (
    /*
      和详情页一样收在 48rem 一栏里：左侧文档树是按视口中线往左量的，
      目录页若铺满 5xl 就会顶到树上去（1280～1500 这一段窄的不只是留白）。
    */
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Docs"
        description="路由与 content/ 的目录结构一一对应，丢进来的 markdown 会自动出现在这里。"
      />

      {groups.map((group) => (
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
