import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import { SITE_BASE } from "./site.config.ts";

// React Router framework mode：路由表、预渲染、资源路径都由 reactRouter 插件接管。
// 部署路径由 site.config.ts 统一给出（可被 SITE_BASE 覆盖），这里与
// react-router.config.ts 的 basename 必须取同一个值，否则 prerender 会直接不执行。
// 注：原来的 @rolldown/plugin-babel + reactCompilerPreset（React Compiler）暂未接入，
// 先保证框架模式跑通，需要时再单独加回来。
export default defineConfig({
  base: SITE_BASE,
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
