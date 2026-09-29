/** 站内 SPA 路由路径 */
export const ROUTES = {
  home: "/",
  docs: "/docs",
  tools: "/tools",
  macConverter: "/tools/mac-converter",
  playground: "/playground",
} as const;

/**
 * 文档详情路径：按 content/ 目录结构把每一段拼到 /docs 后面。
 * 段名可能是中文，交给 encodeURIComponent 编码；路由那边由 `/docs/*` 通配参数接收。
 */
export function docPath(...segments: string[]) {
  return [ROUTES.docs, ...segments.map(encodeURIComponent)].join("/");
}

/** 站外资源路径 */
export const STATIC_PATHS = {
  dufs: "/dufs/常用软件/?noscript",
} as const;
