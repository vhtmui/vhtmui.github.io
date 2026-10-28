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
 * 导航的落点与正文（最宽 48rem 的栏）无关，直接按视口中线往左量：
 * 半宽 24rem + 间隔 2rem + 导航自身 14rem，即 50% - 40rem。
 * 视口收窄时这个值会变成负数，用 max() 兜到 1rem，保证导航永远贴在屏幕内；
 * 1280px（xl）以下干脆整块隐藏 —— 那时正文自己已经占满两侧留白，没有它的位置。
 */
const NAV_RAIL =
  "fixed top-24 left-[max(1rem,calc(50%-40rem))] z-30 hidden max-h-[calc(100svh-8rem)] w-56 overflow-y-auto pr-1 xl:block";

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
        换一篇文档就重挂一次：展开状态是组件里按初始值种下的，
        不加 key 的话前进/后退或从章节导航跳转时，高亮会停在上一页。
      */}
      <aside data-not-typeset aria-label="文档导航" className={NAV_RAIL}>
        <DocsNavTree key={activePath} nodes={tree} activePath={activePath} />
      </aside>

      <Outlet />
    </>
  );
}
