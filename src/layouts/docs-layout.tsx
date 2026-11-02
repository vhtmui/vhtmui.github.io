import { Outlet, useLoaderData, useLocation } from "react-router";
import DocsDock from "@/components/custom/docs-dock";
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
 * 断点比右侧章节导航（67rem / 1072px）更晚，取 85rem / 1360px：屏宽从宽到窄时
 * 先收起左侧目录树，版面变成「正文 + 章节导航」的双列；再窄才轮到章节导航，
 * 只剩正文 + 底部悬浮的目录卡片。这样中间那一段不会两边同时空着。
 *
 * 两个断点都按「刚好装得下」算：正文最短 48rem、间距最小 1.5rem、两栏各 14rem / 13rem，
 * 再加正文两侧各 1rem 内边距，留一点点余量（含 Windows 约 15px 的滚动条），
 * 屏宽够就上，不提前收起（改这里要同步 main.css 的 --docs-shift 媒体区间）。
 *
 * sticky 而不是 fixed：fixed 脱离滚动内容，触摸下拉回弹时正文弹开、导航不动；
 * sticky 跟着内容一起平移。挂载层见 main.css 的 .docs-rail-wrap。
 */
const NAV_RAIL =
  "docs-rail-left sticky top-24 z-30 hidden h-[calc(100svh-8rem)] w-[var(--docs-rail-left)] min-[85rem]:block";

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
      {/* 挂载层 absolute inset-0：不占位，只给 sticky 一个包含块 */}
      <div className="docs-rail-wrap">
        <aside data-not-typeset aria-label="文档导航" className={NAV_RAIL}>
          <DocsNavTree nodes={tree} activePath={activePath} />
        </aside>
      </div>

      <Outlet />

      {/*
        右下角的悬浮操作（现在只有「返回顶部」，之后做成移动端的可展开 dock）。
        放在布局里而不是详情页：目录页滚长了也用得上，且切文档时不用重新挂载。
      */}
      <DocsDock />
    </>
  );
}
