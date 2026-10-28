import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

/**
 * 文档目录树。
 *
 * content/ 有几层就画几层 —— 书的章节挂在书名下、书名挂在 books 下，
 * 不会为了界面的层级限制把结构压平。
 *
 * 视觉沿用 BranchedMenu 的路子：左侧一条渐隐的主干线，每个节点用自己的
 * 一段圆角折线接上去；折叠用 grid-template-rows 0fr→1fr，避免算高度。
 * 差别只在层级递归和每层缩进（14px），所以行高、字号都比原来收了一点。
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

/** 默认展开当前文档所经过的每一层（逐层往下找，命中就继续往里走） */
function openPathTo(nodes: DocsNavNode[], activePath: string, open = new Set<string>()) {
  for (const node of nodes) {
    if (!node.children?.length) continue;
    if (!node.children.some((child) => contains(child, activePath))) continue;

    open.add(node.id);
    openPathTo(node.children, activePath, open);
  }
  return open;
}

const BRANCH_LINE =
  "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-px before:bg-gradient-to-b before:from-border before:via-border before:to-transparent before:content-['']";

const ELBOW =
  "before:absolute before:top-0 before:-left-3.5 before:h-[0.85rem] before:w-3.5 before:rounded-bl-[0.6rem] before:border-b before:border-l before:border-border before:content-['']";

export default function DocsNavTree({ nodes, activePath }: DocsNavTreeProps) {
  const [open, setOpen] = useState(() => openPathTo(nodes, activePath));

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ul className="flex flex-col">
      {nodes.map((node) => (
        <NodeItem
          key={node.id}
          node={node}
          depth={0}
          open={open}
          activePath={activePath}
          onToggle={toggle}
        />
      ))}
    </ul>
  );
}

interface NodeItemProps {
  node: DocsNavNode;
  depth: number;
  open: Set<string>;
  activePath: string;
  onToggle: (id: string) => void;
}

function NodeItem({ node, depth, open, activePath, onToggle }: NodeItemProps) {
  const children = node.children ?? [];
  const isBranch = children.length > 0;
  const isOpen = open.has(node.id);
  const isActive = node.path === activePath;
  /** 分支里有当前文档时，分支头也跟着亮起来 */
  const holdsActive = isBranch && children.some((child) => contains(child, activePath));

  const rowClass = cn(
    "flex w-full items-center gap-0.5 rounded-md py-1.5 pr-1.5 text-left text-[13px] leading-tight no-underline transition-colors",
    "hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
    isActive && "bg-muted font-medium text-primary",
    !isActive && (isOpen || holdsActive ? "text-foreground" : "text-muted-foreground"),
  );

  return (
    <li
      data-active={isActive ? "" : undefined}
      className={cn(depth > 0 && "relative", depth > 0 && ELBOW, "data-[active]:before:border-primary")}
    >
      {isBranch ? (
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => onToggle(node.id)}
          className={rowClass}
        >
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-3 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
              !isOpen && "-rotate-90",
            )}
          />
          <span className="truncate" title={node.label}>
            {node.label}
          </span>
        </button>
      ) : (
        <Link
          to={node.path ?? "#"}
          aria-current={isActive ? "page" : undefined}
          className={cn(rowClass, "pl-3.5")}
        >
          <span className="truncate" title={node.label}>
            {node.label}
          </span>
        </Link>
      )}

      {isBranch ? (
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <ul className={cn("relative pl-3.5", BRANCH_LINE)}>
              {children.map((child) => (
                <NodeItem
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  open={open}
                  activePath={activePath}
                  onToggle={onToggle}
                />
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </li>
  );
}
