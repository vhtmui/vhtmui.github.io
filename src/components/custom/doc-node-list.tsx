import { FileText, Folder } from "lucide-react";
import { Link } from "react-router";
import type { DocTreeNode } from "@/lib/content.server";
import { countDocs } from "@/lib/doc-tree";

/**
 * 文档层级清单：目录在前、文档在后（顺序由 listDocTree 排好），子层缩进并接一条竖线。
 *
 * Docs 首页与各层目录页共用它，所以页面上看到的结构就是 content/ 的真实结构：
 * books → 代码整洁之道 → 各章，而不是把每一章直接摊在 books 底下。
 */
export default function DocNodeList({ nodes }: { nodes: DocTreeNode[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {nodes.map((node) => {
        const isDir = node.kind === "dir";
        const total = isDir ? countDocs(node.children) : 0;

        return (
          <li key={node.id}>
            <Link
              to={node.path}
              className="flex items-baseline justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex min-w-0 items-baseline gap-2">
                {isDir ? (
                  <Folder className="size-3.5 shrink-0 translate-y-0.5 text-muted-foreground" />
                ) : (
                  <FileText className="size-3.5 shrink-0 translate-y-0.5 text-muted-foreground" />
                )}
                <span className="truncate font-medium">{node.label}</span>
              </span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {isDir ? `${total} 篇` : node.file}
              </span>
            </Link>

            {/* 有子层就缩进挂到下面，竖线表示层级 */}
            {node.children.length ? (
              <div className="mt-1 ml-4 border-l pl-3">
                <DocNodeList nodes={node.children} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
