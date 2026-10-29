/**
 * 站点的部署路径，vite 的 `base` 与 react-router 的 `basename` 都从这里取。
 *
 * 两处必须是同一个值：只对上其中一个，构建出来的 HTML 里引的资源地址和路由前缀
 * 就会各说各话（典型症状是预渲染直接不执行、或者页面白屏）。
 *
 * 默认挂在 /my_site_zzy/ 下（内网那台 nginx 的部署方式）；发布到 GitHub Pages 时
 * 由 workflow 传 `SITE_BASE=/`，站点落在根路径。
 */

// 顺带 trim：Windows 的 `set X=/` 容易把尾随空格也带进环境变量
const raw = (process.env.SITE_BASE ?? "/my_site_zzy/").trim();
const trimmed = raw.replace(/^\/+|\/+$/g, "");

/** 带首尾斜杠的部署路径，形如 "/" 或 "/my_site_zzy/" */
export const SITE_BASE = trimmed ? `/${trimmed}/` : "/";
