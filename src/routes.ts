import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

/**
 * 路由表。
 *
 * 等价于原来 main.tsx 里的 createBrowserRouter 配置，区别是：
 * AppLayout 用 layout() 表达，子路由自动挂到它的 Outlet 上；
 * 文档详情用 `docs/*` 通配，参数由 loader 的 params["*"] 接收。
 */
export default [
  layout("./layouts/app-layout.tsx", [
    index("./pages/home-page.tsx"),
    route("docs", "./pages/docs-page.tsx"),
    route("docs/*", "./pages/docs-detail-page.tsx"),
    route("tools", "./pages/tools-page.tsx"),
    route("tools/mac-converter", "./pages/mac-converter-page.tsx"),
    route("playground", "./pages/playground-page.tsx"),
  ]),
  route("*", "./pages/error-page.tsx"),
] satisfies RouteConfig;
