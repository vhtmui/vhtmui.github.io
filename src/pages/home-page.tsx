import { ROUTES, STATIC_PATHS } from "@/config/links";
import ScrollCard from "@/components/custom/scroll-card";
import { Link } from "react-router";

/** 首页入口卡片 */
const HOME_LINKS: Array<{
  to: string;
  label: string;
  description: string;
  static?: boolean;
}> = [
  { to: ROUTES.docs, label: "Docs", description: "文档内容将在这里渲染。" },
  {
    to: ROUTES.macConverter,
    label: "MAC Address Converter",
    description: "MAC 地址格式转换工具。",
  },
  {
    to: STATIC_PATHS.dufs,
    label: "Dufs",
    description: "静态文件目录，浏览与下载常用软件。",
    static: true,
  },
];

/** 覆盖整卡的可点区域，文字由卡片两面负责显示 */
const CARD_LINK =
  "absolute inset-0 z-20 rounded-[25px] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export default function HomePage() {
  return (
    <div className="grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {HOME_LINKS.map((value) => (
        <ScrollCard
          key={value.to}
          title={value.label}
          description={value.description}
        >
          {value.static ? (
            // 站外/静态目录：整页跳转，不走 SPA 路由
            <a href={value.to} aria-label={value.label} className={CARD_LINK} />
          ) : (
            <Link to={value.to} aria-label={value.label} className={CARD_LINK} />
          )}
        </ScrollCard>
      ))}
    </div>
  );
}
