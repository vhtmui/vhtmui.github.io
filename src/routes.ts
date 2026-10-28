import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

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
    // docs 单独一层布局：左侧文档树只在这棵子树里出现。
    // layout() 只认文件、不认路径，路径前缀交给 prefix() 给两个子路由一起加。
    ...prefix("docs", [
      layout("./layouts/docs-layout.tsx", [
        index("./pages/docs-page.tsx"),
        route("*", "./pages/docs-detail-page.tsx"),
      ]),
    ]),
    route("tools", "./pages/tools-page.tsx"),
    route("tools/mac-converter", "./pages/mac-converter-page.tsx"),
    route("playground", "./pages/playground-page.tsx"),
  ]),
  route("*", "./pages/error-page.tsx"),
] satisfies RouteConfig;
