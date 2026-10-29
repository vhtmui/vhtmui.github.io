import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

/**
 * 预览 `react-router build` 的静态产物（ssr: false 下没有运行时服务端，
 * 用任意静态服务器都能跑，这里只是为了本地验证产物形态）。
 *
 * 站点根目录是 build/client：子路径部署时页面在 basename 目录下，
 * 根路径部署（SITE_BASE=/，GitHub Pages）时页面就在根上。
 * 未预渲染的路径回落到 SPA 兜底 HTML。
 */

const ROOT = resolve("build/client");
/** 与 site.config.ts 的 SITE_BASE 同一个约定 */
const SITE_NAME = (process.env.SITE_BASE ?? "/my_site_zzy/").trim().replace(/^\/+|\/+$/g, "");
const SITE_DIR = SITE_NAME ? join(ROOT, SITE_NAME) : ROOT;
const PORT = Number(process.env.PORT ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".data": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/** 子路径部署带 __spa-fallback.html，根路径部署是 404.html，最后退回首页 */
const fallback = ["__spa-fallback.html", "404.html", "index.html"]
  .map((name) => join(SITE_DIR, name))
  .find((file) => existsSync(file));

/** 目录请求取它下面的 index.html；原始路径与解码后的路径都试一遍 */
function resolveFile(urlPath) {
  let decoded = urlPath;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    // 保持原样
  }

  for (const candidate of new Set([urlPath, decoded])) {
    let file = join(ROOT, candidate);
    if (existsSync(file) && statSync(file).isDirectory()) {
      file = join(file, "index.html");
    }
    if (existsSync(file)) return file;
  }

  return null;
}

createServer((req, res) => {
  const file = resolveFile((req.url ?? "/").split("?")[0]) ?? fallback;

  if (!file || !existsSync(file)) {
    res.statusCode = 404;
    res.end("404");
    return;
  }

  res.setHeader("content-type", TYPES[extname(file)] ?? "application/octet-stream");
  res.end(readFileSync(file));
}).listen(PORT, () => {
  console.log(`preview: http://localhost:${PORT}${SITE_NAME ? `/${SITE_NAME}/` : "/"}`);
});
