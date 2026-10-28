import { Outlet, useLoaderData, useLocation } from "react-router";
import DocsNavTree from "@/components/custom/docs-nav-tree";
import { listDocTree } from "@/lib/content.server";

/**
 * docs 体系的中间层布局：左侧只放文档树的入口，右侧留给页面自己。
 *
 * 目录数据在这里读一次，/docs 与 /docs/* 共用同一份 —— 目录页和详情页
 * 都不必再各自列一遍，切换文档时导航也不会重新请求。
 */

/** 只给导航用的元信息：目录名 + 标题 + 站内路径，正文不参与序列化 */
export function loader() {
  return { tree: listDocTree() };
}

/**
 * 导航的落点不写死数字，从视口中线往左量：半宽 + 间距 + 自身宽度，三者都读
 * main.css 里的那一组变量（.docs-rail-left），正文变宽、间距变大时跟着一起动。
 *
 * 断点比右侧章节导航（xl / 1280px）更晚，取 1440px：屏宽从宽到窄时先收起左侧
 * 目录树，版面变成「正文 + 章节导航」的双列；再窄到 xl 以下才轮到章节导航，
 * 只剩正文 + 底部悬浮的目录卡片。这样中间那一段不会两边同时空着。
 */
const NAV_RAIL =
  "docs-rail-left fixed top-24 z-30 hidden h-[calc(100svh-8rem)] w-[var(--docs-rail-left)] min-[1440px]:block";

/** location.pathname 里中文是百分号编码的，而文档路径是原文，比对前先还原 */
function decodePath(pathname: string) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export default function DocsLayout() {
  const { tree } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const activePath = decodePath(pathname);

  return (
    <>
      {/*
        不加 key：树自己跨页面保持挂载，展开状态才不会在切换目录时被重置；
        当前文档的变化由组件内部的 effect 处理（只补开、不收起）。
      */}
      <aside data-not-typeset aria-label="文档导航" className={NAV_RAIL}>
        <DocsNavTree nodes={tree} activePath={activePath} />
      </aside>

      <Outlet />
    </>
  );
}
