import { Minus, Plus } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefCallback,
} from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

/**
 * 文档目录树。
 *
 * content/ 有几层就画几层 —— 书的章节挂在书名下、书名挂在 books 下，
 * 不会为了界面的层级限制把结构压平。
 *
 * 几个约定：
 * - 展开状态由组件持有，切页面不重挂，所以别的分支不会自己收起来；
 *   进入新文档时只把它经过的分支补开，已经展开的保持原样。
 * - 底色块是**一块**跟着走的滑块（同 header-nav），鼠标悬停时滑到悬停项，
 *   指针离开后回到当前文档。
 * - 层级靠子列表左侧那条竖线表达；当前文档经过的那些竖线用主色，其余压暗。
 */

export interface DocsNavNode {
  /** 目录用路径段、文档用站内路径，全树唯一 */
  id: string;
  label: string;
  /** 只有文档节点有 */
  path?: string;
  children?: DocsNavNode[];
}

interface DocsNavTreeProps {
  nodes: DocsNavNode[];
  /** 当前文档的站内路径（已解码） */
  activePath: string;
}

/** 某个分支里是否包含当前文档 */
function contains(node: DocsNavNode, path: string): boolean {
  if (node.path === path) return true;
  return (node.children ?? []).some((child) => contains(child, path));
}

/** 当前文档经过的每一层分支 id（用来补开、也用来点亮竖线） */
function pathTo(nodes: DocsNavNode[], activePath: string, trail: string[] = []): string[] {
  for (const node of nodes) {
    if (!node.children?.length) continue;
    if (!node.children.some((child) => contains(child, activePath))) continue;

    const next = [...trail, node.id];
    const deeper = pathTo(node.children, activePath, next);
    return deeper.length > next.length ? deeper : next;
  }
  return [];
}

/** 所有可折叠的分支 id（一键展开/收起用） */
function branchIdsOf(nodes: DocsNavNode[], ids: string[] = []) {
  for (const node of nodes) {
    if (!node.children?.length) continue;
    ids.push(node.id);
    branchIdsOf(node.children, ids);
  }
  return ids;
}

const ROW =
  "relative z-1 flex w-full items-center gap-2 rounded-md py-1.5 pr-1.5 pl-1.5 text-left text-[13px] leading-tight no-underline transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export default function DocsNavTree({ nodes, activePath }: DocsNavTreeProps) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(pathTo(nodes, activePath)));
  const [hoverId, setHoverId] = useState<string | null>(null);

  const navRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const rows = useRef(new Map<string, HTMLElement>());
  const firstPlace = useRef(true);

  /** 底色块的目标：优先跟随悬停项，指针离开后回到当前文档 */
  const targetId = hoverId ?? activePath;

  const registerRow = useCallback(
    (id: string): RefCallback<HTMLElement> =>
      (element) => {
        if (element) rows.current.set(id, element);
        else rows.current.delete(id);
      },
    [],
  );

  const placePill = useCallback(
    (glide: boolean) => {
      const pill = pillRef.current;
      const nav = navRef.current;
      const row = rows.current.get(targetId);
      if (!pill || !nav) return;

      // 目标行可能被收起来的分支藏着（高度 0 + overflow hidden），这时别露滑块
      if (!row || row.closest("[data-collapsed]")) {
        pill.style.opacity = "0";
        return;
      }

      const navBox = nav.getBoundingClientRect();
      const rowBox = row.getBoundingClientRect();

      // 首次定位直接落位，避免从左上角滑进来
      if (!glide) pill.style.transition = "none";
      pill.style.opacity = "1";
      pill.style.width = `${rowBox.width}px`;
      pill.style.height = `${rowBox.height}px`;
      // 导航自己会滚动，换算成内容坐标（滑块在滚动容器里，跟着内容一起滚）
      pill.style.transform = `translate(${rowBox.left - navBox.left + nav.scrollLeft}px, ${
        rowBox.top - navBox.top + nav.scrollTop
      }px)`;
      if (!glide) {
        void pill.offsetHeight;
        pill.style.transition = "";
      }
    },
    [targetId],
  );

  useLayoutEffect(() => {
    placePill(!firstPlace.current);
    firstPlace.current = false;
    document.fonts.ready.then(() => placePill(false)).catch(() => {});
  }, [placePill]);

  /*
    展开/收起会让行位置在动画里连续变化，跟着走才不会脱节。
    观察的是内容列表而不是外面的滚动容器 —— 滚动容器高度是固定的，
    收起一支时它的尺寸不会变，只有内容高度会变。
  */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const observer = new ResizeObserver(() => placePill(true));
    observer.observe(list);
    return () => observer.disconnect();
  }, [placePill]);

  /*
    切到别的文档时把它所在的分支补开，已经展开的一律不动。
    这里在渲染期调整状态（React 允许同一组件这么做），比放进 effect 少一轮渲染，
    也就不会先画一帧「当前文档缩在收起的分支里」。
  */
  const [tracedPath, setTracedPath] = useState(activePath);
  if (tracedPath !== activePath) {
    setTracedPath(activePath);

    const trail = pathTo(nodes, activePath);
    if (!trail.every((id) => open.has(id))) {
      setOpen((prev) => {
        const next = new Set(prev);
        for (const id of trail) next.add(id);
        return next;
      });
    }
  }

  /** 切到的新文档可能在导航的视野外（书有二十多章），滚到能看见的位置 */
  useEffect(() => {
    const row = rows.current.get(activePath);
    const nav = navRef.current;
    if (!row || !nav) return;

    const rowBox = row.getBoundingClientRect();
    const navBox = nav.getBoundingClientRect();
    if (rowBox.top < navBox.top || rowBox.bottom > navBox.bottom) {
      row.scrollIntoView({ block: "nearest" });
    }
  }, [activePath]);

  /** 分支全集；判断"是不是全展开"和"一键展开"都用它 */
  const branchIds = useMemo(() => branchIdsOf(nodes), [nodes]);
  const allOpen = branchIds.length > 0 && branchIds.every((id) => open.has(id));

  const toggleAll = useCallback(() => {
    if (allOpen) {
      setOpen(new Set<string>());
      return;
    }

    setOpen(new Set(branchIds));

    // 全展开后列表会很长，当前文档很可能被翻到看不见：等展开动画结束再拉回视野
    setTimeout(() => {
      const row = rows.current.get(activePath);
      const nav = navRef.current;
      if (!row?.isConnected || !nav) return;

      const rowBox = row.getBoundingClientRect();
      const navBox = nav.getBoundingClientRect();
      if (rowBox.top < navBox.top || rowBox.bottom > navBox.bottom) {
        row.scrollIntoView({ block: "nearest" });
      }
    }, 340);
  }, [activePath, allOpen, branchIds]);

  const toggle = useCallback(
    (id: string) =>
      setOpen((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    [],
  );

  return (
    <div className="flex h-full flex-col">
      {/*
        一键展开/收起放在滚动区之外：书有二十多章，全展开后列表比导航高得多，
        按钮跟着滚走就点不到了。展开时按钮同时换成「收起」的图标。
      */}
      <div className="mb-1 flex items-center justify-between px-1.5">
        <span className="text-[11px] text-muted-foreground/70">目录</span>
        <button
          type="button"
          onClick={toggleAll}
          title={allOpen ? "全部收起" : "全部展开"}
          aria-label={allOpen ? "全部收起" : "全部展开"}
          aria-expanded={allOpen}
          className="rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {allOpen ? "收起" : "展开"}
        </button>
      </div>

      <div ref={navRef} className="relative min-h-0 flex-1 overflow-y-auto pr-1">
        <span
          ref={pillRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-0 rounded-md bg-muted opacity-0 transition-[transform,width,height,opacity] duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
        />

        <ul
          ref={listRef}
          className="relative flex flex-col"
          onPointerLeave={() => setHoverId(null)}
        >
          {nodes.map((node) => (
            <NodeItem
              key={node.id}
              node={node}
              open={open}
              activePath={activePath}
              hoverId={hoverId}
              onToggle={toggle}
              onHover={setHoverId}
              registerRow={registerRow}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

interface NodeItemProps {
  node: DocsNavNode;
  open: Set<string>;
  activePath: string;
  hoverId: string | null;
  onToggle: (id: string) => void;
  onHover: (id: string) => void;
  registerRow: (id: string) => RefCallback<HTMLElement>;
}

function NodeItem({
  node,
  open,
  activePath,
  hoverId,
  onToggle,
  onHover,
  registerRow,
}: NodeItemProps) {
  const children = node.children ?? [];
  const isBranch = children.length > 0;
  const isOpen = open.has(node.id);
  const isActive = node.path === activePath;
  const isHovered = hoverId === node.id;
  /** 分支里有当前文档时，分支头和它下面那条竖线一起亮起来 */
  const holdsActive = isBranch && children.some((child) => contains(child, activePath));

  const rowClass = cn(
    ROW,
    "hover:text-foreground",
    isActive && "font-medium text-primary",
    !isActive && (isHovered || isOpen || holdsActive ? "text-foreground" : "text-muted-foreground"),
  );

  const content = (
    <>
      <span className="truncate" title={node.label}>
        {node.label}
      </span>
      {isBranch ? (
        <span className="ml-auto inline-flex shrink-0 items-center text-muted-foreground">
          {isOpen ? <Minus className="size-3" /> : <Plus className="size-3" />}
        </span>
      ) : null}
    </>
  );

  return (
    <li>
      {isBranch ? (
        <button
          ref={registerRow(node.id)}
          type="button"
          aria-expanded={isOpen}
          onClick={() => onToggle(node.id)}
          onPointerEnter={(event) => event.pointerType === "mouse" && onHover(node.id)}
          className={rowClass}
        >
          {content}
        </button>
      ) : (
        <Link
          ref={registerRow(node.id)}
          to={node.path ?? "#"}
          aria-current={isActive ? "page" : undefined}
          onPointerEnter={(event) => event.pointerType === "mouse" && onHover(node.id)}
          className={rowClass}
        >
          {content}
        </Link>
      )}

      {isBranch ? (
        <div
          data-collapsed={isOpen ? undefined : ""}
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            {/*
              一级缩进就是这一条竖线：包住当前文档的那几条用主色，其余压暗。
              线画在容器上而不是每一项上，行与行之间不会再出现小折线。
            */}
            <ul
              className={cn(
                "ml-1.5 flex flex-col border-l pl-2 transition-colors",
                holdsActive ? "border-primary/70" : "border-border",
              )}
            >
              {children.map((child) => (
                <NodeItem
                  key={child.id}
                  node={child}
                  open={open}
                  activePath={activePath}
                  hoverId={hoverId}
                  onToggle={onToggle}
                  onHover={onHover}
                  registerRow={registerRow}
                />
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </li>
  );
}
