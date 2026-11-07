import type { DocTreeNode } from "@/lib/content.server";

/**
 * 目录树的小工具。
 *
 * 只依赖类型（`import type`），所以客户端组件也能用 —— content.server 里的
 * 读写逻辑不会跟着进客户端包。
 */

/** 这一层节点下的文档总数（目录算它下面所有文档） */
export function countDocs(nodes: DocTreeNode[]): number {
  return nodes.reduce(
    (total, node) => total + (node.kind === "doc" ? 1 : countDocs(node.children)),
    0,
  );
}
