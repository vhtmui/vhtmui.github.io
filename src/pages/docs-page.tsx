import { useLoaderData } from "react-router";
import DocNodeList from "@/components/custom/doc-node-list";
import PageHeader from "@/components/custom/page-header";
import { pageTitle } from "@/config/site";
import { listDocTree } from "@/lib/content.server";

export const meta = () => [
  { title: pageTitle("Docs") },
  {
    name: "description",
    content: "站内文档目录：书籍、笔记与各类整理内容，严格按 content/ 的目录层级展示。",
  },
];

/**
 * 目录页的数据：只有元信息（目录名 / 标题 / 路径 / 层级），
 * 正文不进 loader 返回值，否则会被序列化进 HTML。
 */
export function loader() {
  return { tree: listDocTree() };
}

/**
 * 文档目录页：内容和左侧目录树用同一棵树，层级就是 content/ 的层级
 * （books → 代码整洁之道 → 各章），目录和文档都能点进自己的页面。
 */
export default function DocsPage() {
  const { tree } = useLoaderData<typeof loader>();

  return (
    /*
      和详情页共用同一个正文宽度变量（.docs-column 里的 --docs-article）：
      两页切换时栏宽一致，也不会顶到左侧文档树上 —— 导航的落点同样是按它算的。
    */
    <div className="docs-column flex flex-col gap-6">
      <PageHeader
        title="Docs"
        description="路由与 content/ 的目录结构一一对应，丢进来的 markdown 会自动出现在这里。"
      />

      {tree.length ? (
        <DocNodeList nodes={tree} />
      ) : (
        <p className="text-sm text-muted-foreground">content/ 下还没有内容。</p>
      )}
    </div>
  );
}
