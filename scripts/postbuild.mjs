import { readdirSync, renameSync, rmSync } from "node:fs";
import { resolve } from "node:path";

/**
 * 构建后整理产物（`pnpm build` 在 react-router build 之后自动调用）。
 *
 * 做两件事：
 * 1. 框架把页面写到 <build>/client/my_site_zzy/，而 Vite 的 assets 与 public 资源
 *    落在 <build>/client 根下；两者 URL 前缀都带 /my_site_zzy/，分开部署会 404，
 *    所以统一归到 basename 目录里，让它直接就是站点根。
 * 2. 预渲染直接把 URL 片段当目录名，中文会保留成 %E5%85%B6%E4%BB%96 这种编码形式，
 *    而 nginx 之类会先把请求 URL 解码再找文件，对不上就 404，这里还原成中文。
 *
 * 注意：不能用 reactRouterConfig 的 buildEnd 做这些 —— 它在预渲染之前就触发了，
 * 那时文档目录还没生成。
 */

/** 与 react-router.config.ts 的 basename 保持一致 */
const SITE_NAME = "my_site_zzy";

const CLIENT_DIR = resolve("build/client");
const SITE_DIR = resolve(CLIENT_DIR, SITE_NAME);

/** 把 URL 编码的目录名还原成原文，自底向上处理 */
function decodeDirNames(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) decodeDirNames(full);

    let decoded = entry.name;
    try {
      decoded = decodeURIComponent(entry.name);
    } catch {
      // 名字里出现裸 % 时保持原样
    }

    if (decoded !== entry.name) renameSync(full, resolve(dir, decoded));
  }
}

for (const entry of readdirSync(CLIENT_DIR, { withFileTypes: true })) {
  if (entry.name === SITE_NAME) continue;

  // index.html 是未预渲染路径的 SPA 兜底，改名后由服务器按 try_files 兜底
  const target = resolve(
    SITE_DIR,
    entry.name === "index.html" ? "__spa-fallback.html" : entry.name,
  );

  // 关掉 emptyOutDir 后这里可能残留上一次的同名内容，直接清掉再放新的
  rmSync(target, { recursive: true, force: true });
  renameSync(resolve(CLIENT_DIR, entry.name), target);
}

decodeDirNames(SITE_DIR);

console.log(`postbuild: 产物已整理到 ${SITE_DIR}`);
