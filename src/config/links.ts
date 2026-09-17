/**
 * 全站链接的唯一来源。
 *
 * 路由表（main.tsx）、导航菜单（layouts/AppLayout）、首页卡片（pages/HomePage）、
 * 错误页（pages/ErrorPage）等都从这里取值。
 * 新增/调整一个路径时只需要改这一处，避免同一个链接在多处以字面量出现而逐渐不一致。
 */

/** 站内 SPA 路由路径，与 main.tsx 中的路由表一一对应 */
export const ROUTES = {
  home: "/",
  docs: "/docs",
  tools: "/tools",
  macConverter: "/tools/mac-converter",
} as const;

/** 由静态资源服务提供、不经过 SPA 路由的路径（需要整页跳转） */
export const STATIC_PATHS = {
  dufs: "/dufs/常用软件/?noscript",
} as const;

export type LinkItem = {
  to: string;
  label: string;
  static?: boolean;
};

/** 顶部导航菜单：宽屏水平布局与小屏下拉布局共用同一份配置 */
export const NAV_LINKS = [
  { to: ROUTES.home, label: "Home" },
  { to: ROUTES.docs, label: "Docs" },
  { to: ROUTES.tools, label: "Tools" },
] satisfies LinkItem[];

/** 首页入口卡片 */
export const HOME_LINKS = [
  { to: ROUTES.docs, label: "Docs" },
  { to: ROUTES.macConverter, label: "MAC Address Converter" },
  { to: "/testpage", label: "Test Page" },
  { to: STATIC_PATHS.dufs, label: "Dufs", static: true },
] satisfies LinkItem[];

/** 判断某个导航项在当前 pathname 下是否处于激活状态 */
export function isNavActive(pathname: string, to: string) {
  if (to === ROUTES.home) return pathname === ROUTES.home;
  return pathname === to || pathname.startsWith(to + "/");
}
