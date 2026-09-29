import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 只在构建期 / 服务端运行的 content 读取逻辑。
 *
 * 文件名带 `.server` 是 React Router 的约定：这类模块不会被打进客户端 bundle，
 * 所以这里可以放心用 node:fs —— 构建预渲染时读文件，客户端产物里不会留下内容。
 */

/** 内容根目录，相对项目根 */
export const CONTENT_DIR = "content";

/**
 * 递归列出 content 下所有 markdown 的路径段（不含 .md 后缀），
 * 例如 [["其他", "Rust"], ["ai问答", "依赖管理设计参考"]]。
 */
export function listDocSegments(dir = CONTENT_DIR, prefix: string[] = []): string[][] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return listDocSegments(join(dir, entry.name), [...prefix, entry.name]);
    }

    if (!entry.name.toLowerCase().endsWith(".md")) return [];

    return [[...prefix, entry.name.replace(/\.md$/i, "")]];
  });
}

/** 读取一篇文档的 markdown 原文 */
export function readDoc(segments: string[]) {
  return readFileSync(join(CONTENT_DIR, ...segments) + ".md", "utf-8");
}

/** 文档对应的站内路径，例如 /docs/其他/Rust */
export function docRoute(segments: string[]) {
  return `/docs/${segments.join("/")}`;
}
