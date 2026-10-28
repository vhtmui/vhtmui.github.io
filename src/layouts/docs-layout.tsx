import { useLoaderData, useLocation, useNavigate, Outlet } from "react-router";
import BranchedMenu, { type BranchedMenuItem } from "@/components/BranchedMenu";
import { listDocGroups } from "@/lib/content.server";

/**
 * docs 体系的中间层布局：左侧只放文档树的入口，右侧留给页面自己。
 *
 * 目录数据在这里读一次，/docs 与 /docs/* 共用同一份 —— 目录页和详情页
 * 都不必再各自列一遍，切换文档时导航也不会重新请求。
 */

/** 只给导航用的元信息：标题 + 站内路径，正文不参与序列化 */
export function loader() {
  return { groups: listDocGroups() };
}

/**
 * 导航的落点与正文（最宽 48rem 的栏）无关，直接按视口中线往左量：
 * 半宽 24rem + 间隔 2rem + 导航自身 14rem，即 50% - 40rem。
 * 视口收窄时这个值会变成负数，用 max() 兜到 1rem，保证导航永远贴在屏幕内；
 * 1280px（xl）以下干脆整块隐藏 —— 那时正文自己已经占满两侧留白，没有它的位置。
 */
const NAV_RAIL =
  "fixed top-24 left-[max(1rem,calc(50%-40rem))] z-30 hidden max-h-[calc(100svh-8rem)] w-56 overflow-y-auto xl:block";

/** location.pathname 里中文是百分号编码的，而文档路径是原文，比对前先还原 */
function decodePath(pathname: string) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export default function DocsLayout() {
  const { groups } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  /**
   * BranchedMenu 只有两级，层级靠「按目录成支」来收敛：
   * 分支头取文档所在的最后一级目录名，叶子是目录里的页面。
   * 于是 content/books/代码整洁之道/03-函数.md 落在「代码整洁之道」一支下 ——
   * 书比站点的第一级分类更重要，再深的目录也只是并进同一支，不会被拆散。
   * 直接放在 content 根下的文件没有目录名，归到「未分类」。
   */
  const sections = new Map<string, BranchedMenuItem>();

  for (const doc of groups.flatMap((group) => group.docs)) {
    const dirs = doc.segments.slice(0, -1);
    const key = dirs.join("/");
    const label = dirs[dirs.length - 1] ?? "未分类";

    let section = sections.get(key);
    if (!section) {
      section = { label, children: [] };
      sections.set(key, section);
    }

    section.children?.push({ value: doc.path, label: doc.title });
  }

  const items = [...sections.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, section]) => section);

  const activePath = decodePath(pathname);

  /** 当前文档所在的分支默认展开，其余折叠 */
  const defaultOpen = items.findIndex((section) =>
    section.children?.some((child) => child.value === activePath),
  );

  return (
    <>
      {/*
        换一篇文档就重挂一次：组件内部的展开/激活是按初始值种下的状态，
        不加 key 的话前进/后退或从章节导航跳转时，高亮会停在上一页。
      */}
      <aside data-not-typeset aria-label="文档导航" className={NAV_RAIL}>
        <BranchedMenu
          key={activePath}
          items={items}
          defaultOpen={defaultOpen}
          defaultActive={activePath}
          width={224}
          color="var(--foreground)"
          accentColor="var(--primary)"
          lineColor="var(--border)"
          onSelect={(value) => navigate(value)}
        />
      </aside>

      <Outlet />
    </>
  );
}
