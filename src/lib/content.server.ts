import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 只在构建期运行的 content 读取逻辑。
 *
 * 文件名带 `.server` 是 React Router 的约定：这类模块不会被打进客户端 bundle，
 * 所以这里可以放心用 node:fs —— 预渲染时读文件，客户端产物里不会留下正文。
 *
 * 注意：loader 返回的数据会被序列化进 HTML，所以对外只暴露 DocMeta 这类元信息，
 * 正文（DocSource.content）只能留在 loader 内部用于渲染。
 */

/** 内容根目录，相对项目根 */
export const CONTENT_DIR = "content";

/** 文档元信息：可以安全地传给客户端 */
export interface DocMeta {
  /** 目录结构对应的路径段，例如 ["其他", "Rust"] */
  segments: string[];
  /** 分类目录名；直接放在 content 根下的文件为空串 */
  group: string;
  /** 文件名（去掉 .md） */
  name: string;
  /** 文档标题：frontmatter.title 优先，其次正文首个一级标题，再兜底文件名 */
  title: string;
  /** 站内路由路径，例如 /docs/其他/Rust */
  path: string;
}

/** 文档源码：元信息 + 正文，只在服务端流转 */
export interface DocSource extends DocMeta {
  /** 去掉 frontmatter 与首个一级标题之后的正文 */
  content: string;
  frontmatter: Record<string, string>;
}

/** 分类 + 该分类下的文档，目录页直接用 */
export interface DocGroup {
  name: string;
  docs: DocMeta[];
}

/** 递归列出 content 下所有 markdown 的路径段（不含 .md 后缀） */
export function listDocSegments(dir = CONTENT_DIR, prefix: string[] = []): string[][] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return listDocSegments(join(dir, entry.name), [...prefix, entry.name]);
    }

    if (!entry.name.toLowerCase().endsWith(".md")) return [];

    return [[...prefix, entry.name.replace(/\.md$/i, "")]];
  });
}

/** 文档对应的站内路径，例如 /docs/其他/Rust */
export function docRoute(segments: string[]) {
  return `/docs/${segments.join("/")}`;
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
  if (!matched) return { title: fallback, content: body };

  return { title: matched[1], content: body.slice(matched[0].length) };
}

/** 读取一篇文档：文件不存在时抛错（预渲染只会访问存在的路径） */
export function readDocSource(segments: string[]): DocSource {
  const raw = readFileSync(join(CONTENT_DIR, ...segments) + ".md", "utf-8");
  const { frontmatter, body } = splitFrontmatter(raw);
  const name = segments[segments.length - 1];
  const { title, content } = takeHeading(body, frontmatter.title ?? name);

  return {
    segments,
    group: segments.length > 1 ? segments[0] : "",
    name,
    title,
    path: docRoute(segments),
    content,
    frontmatter,
  };
}

/** 全部文档的元信息，按分类归拢好（分组名与文档名都排过序） */
export function listDocGroups(): DocGroup[] {
  const groups: DocGroup[] = [];

  for (const segments of listDocSegments()) {
    const source = readDocSource(segments);
    const meta: DocMeta = {
      segments: source.segments,
      group: source.group,
      name: source.name,
      title: source.title,
      path: source.path,
    };

    const existed = groups.find((group) => group.name === meta.group);
    if (existed) existed.docs.push(meta);
    else groups.push({ name: meta.group, docs: [meta] });
  }

  for (const group of groups) {
    group.docs.sort((a, b) => a.name.localeCompare(b.name));
  }
  groups.sort((a, b) => a.name.localeCompare(b.name));

  return groups;
}
