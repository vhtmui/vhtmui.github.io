import { readdirSync, renameSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import type { Config } from "@react-router/dev/config";
import { docRoute, listDocSegments } from "./src/lib/content.server";

/** 站点部署在子路径下，base（vite.config.ts）与本值必须完全一致，含结尾斜杠 */
const BASENAME = "/my_site_zzy/";

const CLIENT_DIR = "build/client";

/**
 * React Router framework mode 配置。
 *
 * - `appDirectory: "src"` 沿用现有源码目录，页面不用搬家；
 * - `ssr: false` 意味着没有运行时服务端，构建产物就是一堆静态文件；
 * - `prerender` 在构建期把静态路由 + content 下每篇文档都渲染成 HTML，
 *   loader 也在这时执行（读文件、渲染 markdown），所以客户端产物里不会留下正文。
 */
export default {
  appDirectory: "src",
  basename: BASENAME,
  ssr: false,
  prerender: async ({ getStaticPaths }) => [
    ...getStaticPaths(),
    ...listDocSegments().map(docRoute),
  ],
  /**
   * 收尾整理产物：框架把页面写到 build/client/my_site_zzy/，而 Vite 的 assets 与
   * SPA fallback 落在 build/client 根下。两者的 URL 前缀都带 /my_site_zzy/，
   * 分开部署会因为对不上路径而全部 404，所以这里把它们归拢到 basename 目录里，
   * 让 build/client/my_site_zzy 直接就是要上传的站点根。
   */
  buildEnd: async () => {
    const siteName = BASENAME.replace(/^\/|\/$/g, "");
    const siteDir = resolve(CLIENT_DIR, siteName);

    for (const entry of readdirSync(CLIENT_DIR, { withFileTypes: true })) {
      if (entry.name === siteName) continue;

      // index.html 是未预渲染路径的 SPA 兜底，改名后由服务器按 try_files 兜底
      const target = resolve(
        siteDir,
        entry.name === "index.html" ? "__spa-fallback.html" : entry.name,
      );

      rmSync(target, { recursive: true, force: true });
      renameSync(resolve(CLIENT_DIR, entry.name), target);
    }
  },
} satisfies Config;
