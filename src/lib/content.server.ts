import { readdirSync, readFileSync, statSync } from "node:fs";
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

/** 目录节点：目录本身也是一层，可以有自己的页面（列它下面的内容） */
export interface DocDirSource {
  segments: string[];
  name: string;
  path: string;
  children: DocTreeNode[];
}

/**
 * 侧栏导航 / 目录页共用的树节点：目录就是目录，文档就是文档，层级与 content/
 * 一一对应（books → 代码整洁之道 → 各章），不为了界面的层级限制去压平。
 *
 * 目录也有 path：点目录名进的是「这一层的索引页」，不是某篇正文。
 */
export interface DocTreeNode {
  /** 目录用路径段拼成，文档用站内路径，都是唯一的 */
  id: string;
  /** 目录显示目录名，文档显示标题 */
  label: string;
  /** 站内路径：目录指向索引页，文档指向正文页 */
  path: string;
  kind: "dir" | "doc";
  /** 文档的文件名（含 .md），目录没有 */
  file?: string;
  children: DocTreeNode[];
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
    name,
    title,
    path: docRoute(segments),
    content,
    frontmatter,
  };
}

/**
 * 按导航顺序把整棵树拍平：先目录、后文档，各自按名字排，逐层往下。
 * 顺序与 listDocTree 完全一致 —— 翻页导航得跟着左侧目录树的阅读顺序走，
 * 不能另立一套（否则「下一篇」跳到的不是目录里的下一项）。
 *
 * 只在构建期调用；每篇文档都要打开一次才能拿到标题。
 */
export function listDocFlat(dir = CONTENT_DIR, prefix: string[] = []): DocMeta[] {
  const dirs: Array<{ name: string; segments: string[] }> = [];
  const docs: DocMeta[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      dirs.push({ name: entry.name, segments: [...prefix, entry.name] });
      continue;
    }

    if (!entry.name.toLowerCase().endsWith(".md")) continue;

    const source = readDocSource([...prefix, entry.name.replace(/\.md$/i, "")]);
    docs.push({
      segments: source.segments,
      name: source.name,
      title: source.title,
      path: source.path,
    });
  }

  dirs.sort((a, b) => a.name.localeCompare(b.name));
  docs.sort((a, b) => a.name.localeCompare(b.name));

  return [...dirs.flatMap((item) => listDocFlat(join(dir, item.name), item.segments)), ...docs];
}

/**
 * content/ 的目录树：目录节点在前、文档节点在后，各自按名字排。
 * 文档标题要读文件才知道，所以这里会打开每篇文档；目录自带自己的路径，
 * 点进去是这一层的索引页（见 readDocDir）。
 */
export function listDocTree(dir = CONTENT_DIR, prefix: string[] = []): DocTreeNode[] {
  const dirs: DocTreeNode[] = [];
  const docs: DocTreeNode[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const segments = [...prefix, entry.name];
      dirs.push({
        id: segments.join("/"),
        label: entry.name,
        path: docRoute(segments),
        kind: "dir",
        children: listDocTree(join(dir, entry.name), segments),
      });
      continue;
    }

    if (!entry.name.toLowerCase().endsWith(".md")) continue;

    const source = readDocSource([...prefix, entry.name.replace(/\.md$/i, "")]);
    docs.push({
      id: source.path,
      label: source.title,
      path: source.path,
      kind: "doc",
      file: entry.name,
      children: [],
    });
  }

  // id 里带着文件名，按它排就是按文件名排（第 10 章不会跑到第 2 章前面）
  dirs.sort((a, b) => a.id.localeCompare(b.id));
  docs.sort((a, b) => a.id.localeCompare(b.id));

  return [...dirs, ...docs];
}

/**
 * 读取一个目录节点：目录名、它的路径，以及下一层的内容。
 * 路径不存在或不是目录时返回 null（交给调用方按文档去读）。
 *
 * 目录页面就是靠它渲染的：/docs/books、/docs/books/代码整洁之道 这类
 * 「由目录名产生的 URL」不再 404。
 */
export function readDocDir(segments: string[]): DocDirSource | null {
  if (!segments.length) return null;

  const full = join(CONTENT_DIR, ...segments);
  try {
    if (!statSync(full).isDirectory()) return null;
  } catch {
    return null;
  }

  return {
    segments,
    name: segments[segments.length - 1],
    path: docRoute(segments),
    children: listDocTree(full, segments),
  };
}

/** 所有目录的路径段（预渲染目录页用，和预渲染文档页配套） */
export function listDocDirs(dir = CONTENT_DIR, prefix: string[] = []): string[][] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) return [];

    const segments = [...prefix, entry.name];
    return [segments, ...listDocDirs(join(dir, entry.name), segments)];
  });
}
