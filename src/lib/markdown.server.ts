import type { Element, ElementContent, Parents, Root as HastRoot, Text } from "hast";
import { Check, Copy } from "lucide-react";
import type { Heading, Root, RootContent } from "mdast";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import {
  getSingletonHighlighter,
  type BundledLanguage,
  type BundledTheme,
  type SpecialLanguage,
} from "shiki";
import { unified } from "unified";
import { visit } from "unist-util-visit";

/**
 * markdown → HTML，只在构建期跑（loader 里调用）。
 *
 * 高亮也放在构建期：客户端拿到的是渲染好的 HTML，既不带 markdown 原文，
 * 也不用加载 shiki 的 wasm 和语言包。代码块的复制按钮同样是构建期写好的
 * 静态 HTML，交互由客户端事件委托处理，不进 React 树、不影响水合。
 */

/** 章节导航用的目录项 */
export interface TocItem {
  /** 正文标题的锚点 id，构建期生成，客户端直接拿来做 #hash 跳转 */
  id: string;
  level: number;
  text: string;
}

/* --------------------------------- 高亮 ---------------------------------- */

/** 浅色用 slack-ochin、深色用 slack-dark，与既有站点保持一致 */
const SHIKI_THEMES = {
  light: "slack-ochin",
  dark: "slack-dark",
} satisfies Record<string, BundledTheme>;

/** shiki 的语言标识："text" 属于特殊语言，不在 BundledLanguage 里 */
type ShikiLang = BundledLanguage | SpecialLanguage;

/** 预加载语言：content/ 里实际出现过的那些，没在列表里的退化成纯文本 */
const SHIKI_LANGS: ShikiLang[] = [
  "rust",
  "powershell",
  "typescript",
  "tsx",
  "javascript",
  "json",
  "html",
  "css",
  "python",
  "bash",
  "markdown",
  // 书里搬过来的章节（代码整洁之道）几乎全是 Java，零星有 XML / SQL
  "java",
  "xml",
  "sql",
  "text",
];

/** shiki 单例：构建期只初始化一次，避免每篇文档都重建 */
let highlighterPromise: ReturnType<typeof getSingletonHighlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= getSingletonHighlighter({
    themes: [SHIKI_THEMES.light, SHIKI_THEMES.dark],
    langs: SHIKI_LANGS,
  });

  return highlighterPromise;
}

function normalizeLang(lang: string): ShikiLang {
  return SHIKI_LANGS.find((item) => item === lang) ?? "text";
}

/* --------------------------------- 目录 ---------------------------------- */

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

/* -------------------------------- 代码块 --------------------------------- */

/** 递归取节点的纯文本（代码块的源码） */
function nodeText(node: Element): string {
  return node.children
    .map((child) => {
      if (child.type === "text") return child.value;
      if (child.type === "element") return nodeText(child);
      return "";
    })
    .join("");
}

/**
 * 图标直接用 lucide：按钮是构建期写进 HTML 的静态节点，不进 React 树也不参与
 * 水合，所以这里用 react-dom/server 把组件渲染成 SVG 字符串，形状与站内其他
 * 按钮（如 mac-converter 的 Copy / Check）保持一致。
 */
const COPY_ICON = renderToStaticMarkup(createElement(Copy, { className: "code-copy-icon" }));
const CHECK_ICON = renderToStaticMarkup(createElement(Check, { className: "code-check-icon" }));

/** 包成 raw 节点（hast 的半标准节点，类型由 mdast-util-to-hast 注册），交给 to-html 原样输出 */
function rawHtml(value: string): ElementContent {
  return { type: "raw", value };
}

/** 复制按钮：静态 HTML，两个图标用 CSS 按 data-copied 切换 */
function copyButton(): Element {
  return {
    type: "element",
    tagName: "button",
    properties: {
      type: "button",
      className: ["code-copy"],
      dataCopyCode: "",
      "aria-label": "复制代码",
    },
    children: [rawHtml(COPY_ICON), rawHtml(CHECK_ICON)],
  };
}

/**
 * 代码块：shiki 高亮 + 外层容器（语言标签 + 复制按钮）。
 *
 * 自己调 `codeToHast` 而不是用现成的 rehype 包装，是因为语言信息在
 * `<code class="language-xxx">` 上，包装和高亮放在一起处理最省事，
 * 也方便以后插行号、行高亮之类的东西。
 */
function rehypeCodeBlocks() {
  return async (tree: HastRoot) => {
    const highlighter = await getHighlighter();
    const targets: Array<{ parent: Parents; index: number; node: Element }> = [];

    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || typeof index !== "number" || !parent) return;

      const code = node.children.find(
        (child): child is Element => child.type === "element" && child.tagName === "code",
      );
      if (code) targets.push({ parent, index, node });
    });

    // 倒序替换，避免前面的替换让后面的下标错位
    for (const { parent, index, node } of targets.reverse()) {
      const code = node.children.find(
        (child): child is Element => child.type === "element" && child.tagName === "code",
      );
      if (!code) continue;

      const langClass = (code.properties.className as string[] | undefined)?.find((name) =>
        name.startsWith("language-"),
      );
      const lang = normalizeLang(langClass?.slice("language-".length) ?? "text");

      const highlighted = highlighter.codeToHast(nodeText(code), {
        lang,
        themes: SHIKI_THEMES,
        // 不要把浅色写成行内 color / background-color，否则 .dark 的 CSS 覆盖不了；
        // 关掉之后颜色全部走 --shiki-light / --shiki-dark 变量，交由样式表切换
        defaultColor: false,
      });
      const pre = highlighted.children.find(
        (child): child is Element => child.type === "element" && child.tagName === "pre",
      );
      if (!pre) continue;

      const tag: Element = {
        type: "element",
        tagName: "span",
        properties: { className: ["code-lang"] },
        children: [{ type: "text", value: lang } satisfies Text],
      };

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["code-block"], dataCodeLang: lang },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: { className: ["code-block-bar"] },
            children: [tag, copyButton()],
          },
          pre,
        ],
      };
    }
  };
}

/**
 * 图片路径补部署前缀。
 *
 * markdown 里统一写站内绝对路径（`/books/clean-code/x.jpeg`），这样换部署
 * 子路径时不用改正文；站点实际挂在 base 下，产物里得是 `/my_site_zzy/books/...`。
 * 外链和已经是完整 URL 的一律不动。
 */
function rehypeAssetBase() {
  const base = import.meta.env.BASE_URL;

  return (tree: HastRoot) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;

      const src = node.properties?.src;
      if (typeof src !== "string" || !src.startsWith("/") || src.startsWith("//")) return;

      node.properties.src = base + src.slice(1);
    });
  };
}

/**
 * 表格：套一层横向滚动容器。
 *
 * 表格自己的 `max-width: 100%` 拦不住内容宽度 —— 表头是 nowrap，列一多最小
 * 宽度就超过容器，窄屏下整页都会被撑出横向滚动条。typeset 里约定了
 * `.typeset-scroll` 这个包装：由它接管 overflow-x 和块级外边距，表格退化成
 * `width: max-content` 在容器里横滑，不再顶着版面往外跑。
 */
function rehypeTableScroll() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "table" || typeof index !== "number" || !parent) return;

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["typeset-scroll"] },
        children: [node],
      };
    });
  };
}

/* --------------------------------- 出口 ---------------------------------- */

/** 渲染一篇文档的正文，返回 HTML 与章节目录 */
export async function renderMarkdown(body: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeCodeBlocks)
    .use(rehypeTableScroll)
    .use(rehypeAssetBase)
    // 代码块栏里的图标是现成的 SVG 片段（raw 节点），需要放行；正文里的
    // 原始 HTML 会被 remark-rehype 丢掉（非危险模式），不会跟着漏到这里
    .use(rehypeStringify, { allowDangerousHtml: true });

  const tree = processor.parse(body) as Root;
  const toc = collectToc(tree);
  const hast = await processor.run(tree);

  return { html: processor.stringify(hast), toc };
}
