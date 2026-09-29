import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// React Router framework mode：路由表、预渲染、资源路径都由 reactRouter 插件接管。
// 部署子路径由 react-router.config.ts 的 basename 决定（框架会据此设置 Vite 的 base），
// 这里不要再手动写 base —— 两边都写会互相打架，prerender 会直接不执行。
// 注：原来的 @rolldown/plugin-babel + reactCompilerPreset（React Compiler）暂未接入，
// 先保证框架模式跑通，需要时再单独加回来。
export default defineConfig({
  // 与 react-router.config.ts 的 basename 保持一致，末尾斜杠不能省
  base: "/my_site_zzy/",
  plugins: [tailwindcss(), reactRouter()],
  // 不要清理 outDir：构建目录由框架管理，重复清理与本机的安全删除机制冲突会直接中断构建
  build: { emptyOutDir: false },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
