import { createLucideIcon, type IconNode } from "lucide-react";

/**
 * GitHub 图标。
 *
 * 新版 lucide 把品牌图标移出了主包（已不再导出 `Github`），这里用它的
 * `createLucideIcon` 把原来那枚图标原样还原：同样的 24 视窗、2px 线宽、
 * `currentColor` 描边，和顶栏其余图标是同一套画法，不会突然混进一个填充色 SVG。
 */
const ICON: IconNode = [
  [
    "path",
    {
      d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",
      // lucide 的内置图标每个子元素都带 key，这里照做，免得渲染时报警告
      key: "github-body",
    },
  ],
  ["path", { d: "M9 18c-4.51 2-5-2-7-2", key: "github-tail" }],
];

const GithubIcon = createLucideIcon("github", ICON);

export default GithubIcon;
