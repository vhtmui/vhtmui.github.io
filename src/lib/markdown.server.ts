import type { Heading, Root, RootContent } from "mdast";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

/**
 * markdown → HTML，只在构建期跑（loader 里调用）。
 *
 * 之所以不用 React 渲染 markdown：客户端只需要一段渲染好的 HTML 字符串，
 * 把 markdown 解析器留在构建期，客户端产物里就既没有原文也没有解析器。
 */

/** 章节导航用的目录项 */
export interface TocItem {
  /** 正文标题的锚点 id，构建期生成，客户端直接拿来做 #hash 跳转 */
  id: string;
  level: number;
  text: string;
}

/** 递归取标题的纯文本 */
function headingText(node: Heading) {
  let text = "";

  const walk = (children: readonly RootContent[]) => {
    for (const child of children) {
      if ("value" in child && typeof child.value === "string") {
        text += child.value;
      } else if ("children" in child) {
        walk(child.children as RootContent[]);
      }
    }
  };

  walk(node.children);
  return text.trim();
}

/**
 * 给正文标题编号、把 id 写回节点，并顺手收集目录。
 *
 * id 用「级别-序号」（h2-1、h3-2）而不是标题文本：中文标题走 slug 会变成
 * 一长串百分号编码，复制粘贴都难看，编号则简短且稳定。
 */
function collectToc(tree: Root): TocItem[] {
  const toc: TocItem[] = [];
  const counters = new Map<number, number>();

  const walk = (nodes: readonly RootContent[]) => {
    for (const node of nodes) {
      if (node.type === "heading") {
        const level = node.depth;
        const index = (counters.get(level) ?? 0) + 1;
        counters.set(level, index);

        const id = `h${level}-${index}`;
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, id },
        };
        toc.push({ id, level, text: headingText(node) });
      }

      if ("children" in node) walk(node.children as RootContent[]);
    }
  };

  walk(tree.children);
  return toc;
}

/**
 * 渲染一篇文档的正文。
 *
 * 后续要加的东西都挂在这条 rehype 管线上，客户端无需变化：
 * - shiki 高亮：在 remarkRehype 之后 `.use(rehypeShiki, {...})`
 * - 代码块复制按钮：再加一个 rehype 插件给 <pre> 外层包一个容器
 * - 宽表格横向滚动：rehype 插件包一层 `.typeset-scroll`
 */
export async function renderMarkdown(body: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify);

  const tree = processor.parse(body) as Root;
  const toc = collectToc(tree);
  const hast = await processor.run(tree);

  return { html: processor.stringify(hast), toc };
}
