import type { Config } from "@react-router/dev/config";
import { SITE_BASE } from "./site.config.ts";
import { docRoute, listDocSegments } from "./src/lib/content.server";

/**
 * React Router framework mode 配置。
 *
 * - `appDirectory: "src"` 沿用现有源码目录，页面不用搬家；
 * - `ssr: false` 意味着没有运行时服务端，构建产物就是一堆静态文件；
 * - `prerender` 在构建期把静态路由 + content 下每篇文档都渲染成 HTML，
 *   loader 同时执行（读文件、渲染 markdown），所以客户端产物里没有任何 markdown。
 *
 * 产物整理（assets 归位、中文目录名还原）在 scripts/postbuild.mjs 里做：
 * 配置的 buildEnd 在预渲染之前就会触发，那时文档目录还没生成。
 */
export default {
  appDirectory: "src",
  // 与 vite 的 base 同源（site.config.ts），含结尾斜杠
  basename: SITE_BASE,
  ssr: false,
  prerender: async ({ getStaticPaths }) => [
    ...getStaticPaths(),
    ...listDocSegments().map(docRoute),
  ],
} satisfies Config;
