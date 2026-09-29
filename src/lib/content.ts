import { docPath } from "@/config/links";

/**
 * content/ 目录 → 文档索引。
 *
 * SvelteKit 那边靠 `[...docs]` 参数文件夹 + 服务端 readFile 按 URL 取文件；
 * 这里是纯 SPA，没有服务端，所以换成构建期收集：
 * `import.meta.glob` 会把 content 下所有 markdown 的原文打包进产物，
 * 运行时只要一条 `/docs/*` 通配路由，URL 路径本身就是要找的文档地址，
 * 不需要为每个文件写一条路由，也不需要额外的 json 清单。
 */

/** 键形如 "/content/ai问答/依赖管理设计参考.md"，值是 markdown 原文 */
const MODULES = import.meta.glob("/content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const CONTENT_PREFIX = "/content/";

export interface DocEntry {
  /** 目录结构对应的路径段，例如 ["ai问答", "依赖管理设计参考"] */
  segments: string[];
  /** 分类目录名；直接放在 content 根下的文件为空串 */
  group: string;
  /** 文件名（去掉 .md），用作导航文字的兜底 */
  name: string;
  /** 文档标题：frontmatter.title 优先，其次正文第一个 `# 标题`，再兜底文件名 */
  title: string;
  /** 站内路由路径，例如 /docs/ai%E9%97%AE%E7%AD%94/... */
  path: string;
  /** 去掉 frontmatter 之后的 markdown 正文 */
  body: string;
  /** frontmatter 里的键值（只做浅解析） */
  frontmatter: Record<string, string>;
}

/** 分组后的目录，用于 docs 首页 */
export interface DocGroup {
  name: string;
  docs: DocEntry[];
}

/** 拆出文件开头的 `--- ... ---` 块；不引 YAML 依赖，只认 `key: value` */
function splitFrontmatter(source: string) {
  const matched = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!matched) return { frontmatter: {}, body: source };

  const frontmatter: Record<string, string> = {};
  for (const line of matched[1].split(/\r?\n/)) {
    const pair = /^([\w-]+)\s*:\s*(.*)$/.exec(line.trim());
    if (pair) frontmatter[pair[1]] = pair[2].replace(/^["']|["']$/g, "");
  }

  return { frontmatter, body: source.slice(matched[0].length) };
}

/**
 * 取正文开头的第一个一级标题，并把它从正文里摘掉——
 * 标题已经显示在页头上了，正文里再出现一次就是重复。
 */
function takeHeading(body: string, fallback: string) {
  const matched = /^\s*#\s+(.+?)\s*\r?\n/.exec(body);
  if (!matched) return { title: fallback, body };

  return { title: matched[1], body: body.slice(matched[0].length) };
}

function buildDocs(): DocEntry[] {
  return Object.entries(MODULES)
    .map(([file, raw]) => {
      const segments = file.slice(CONTENT_PREFIX.length).replace(/\.md$/i, "").split("/");
      const name = segments[segments.length - 1];
      const { frontmatter, body: rawBody } = splitFrontmatter(raw);
      const { title, body } = takeHeading(rawBody, frontmatter.title ?? name);

      return {
        segments,
        group: segments.length > 1 ? segments[0] : "",
        name,
        title,
        path: docPath(...segments),
        body,
        frontmatter,
      };
    })
    .sort(
      (a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name),
    );
}

/** content 目录里的全部文档 */
export const ALL_DOCS = buildDocs();

/** 按分类归拢后的目录树 */
export const DOC_GROUPS: DocGroup[] = ALL_DOCS.reduce<DocGroup[]>((groups, doc) => {
  const existed = groups.find((group) => group.name === doc.group);
  if (existed) {
    existed.docs.push(doc);
  } else {
    groups.push({ name: doc.group, docs: [doc] });
  }
  return groups;
}, []);

/** 路径段 → 文档，查表用解码后的路径 */
const DOC_BY_PATH = new Map(ALL_DOCS.map((doc) => [doc.segments.join("/"), doc]));

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * 按路由参数找文档。
 * `/docs/*` 拿到的通配参数可能带编码、末尾斜杠或 .md 后缀，这里统一容错。
 */
export function findDoc(splat: string) {
  const key = safeDecode(splat)
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.md$/i, "");

  return DOC_BY_PATH.get(key);
}
