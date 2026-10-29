import { copyFileSync, existsSync, readdirSync, renameSync, rmSync } from "node:fs";
import { resolve } from "node:path";

/**
 * 构建后整理产物（`pnpm build` 在 react-router build 之后自动调用）。
 *
 * 做两件事：
 * 1. 子路径部署时，框架把页面写到 <build>/client/<basename>/，而 Vite 的 assets 与
 *    public 资源落在 <build>/client 根下；两者 URL 前缀都带 basename，分开部署会 404，
 *    所以统一归到 basename 目录里，让它直接就是站点根。
 *    根路径部署（SITE_BASE=/）时前缀是 "/"，产物本来就在正确位置，不用搬。
 * 2. 预渲染直接把 URL 片段当目录名，中文会保留成 %E5%85%B6%E4%BB%96 这种编码形式，
 *    而 nginx / GitHub Pages 会先把请求 URL 解码再找文件，对不上就 404，这里还原成中文。
 *
 * 注意：不能用 reactRouterConfig 的 buildEnd 做这些 —— 它在预渲染之前就触发了，
 * 那时文档目录还没生成。
 */

/** 与 site.config.ts 的 SITE_BASE 同一个约定；这里跑在纯 Node 下，只能照抄一行 */
const SITE_NAME = (process.env.SITE_BASE ?? "/my_site_zzy/").trim().replace(/^\/+|\/+$/g, "");
/** 空串 = 部署在根路径 */
const AT_ROOT = SITE_NAME === "";

const CLIENT_DIR = resolve("build/client");
const SITE_DIR = AT_ROOT ? CLIENT_DIR : resolve(CLIENT_DIR, SITE_NAME);

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

if (!AT_ROOT) {
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
}

decodeDirNames(SITE_DIR);

/*
  GitHub Pages 没有 nginx 的 try_files：对未知路径回落到站点根的 404.html。
  框架已经把「根路由空壳」写在 __spa-fallback.html（不是预渲染过的首页），复制成
  404.html 即可，访问不存在的文档时由客户端路由接管、落进应用自己的 404。
  nginx 部署用不上它，留着也无害。
*/
{
  const source = ["__spa-fallback.html", "index.html"]
    .map((name) => resolve(SITE_DIR, name))
    .find((file) => existsSync(file));

  if (source) {
    const fallback = resolve(SITE_DIR, "404.html");
    rmSync(fallback, { force: true });
    copyFileSync(source, fallback);
  }
}

console.log(`postbuild: 产物已整理到 ${SITE_DIR}${AT_ROOT ? "（根路径部署）" : ""}`);
