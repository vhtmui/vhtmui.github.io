import { ROUTES, STATIC_PATHS } from "@/config/links";
import PixelCard from "@/components/pixel-card";
import { Link } from "react-router";

/** 首页入口卡片 */
const HOME_LINKS: Array<{ to: string; label: string; static?: boolean }> = [
  { to: ROUTES.docs, label: "Docs" },
  { to: ROUTES.macConverter, label: "MAC Address Converter" },
  { to: STATIC_PATHS.dufs, label: "Dufs", static: true },
];

/** 整张卡片可点，文字不做链接态（无下划线、无按钮外观） */
const CARD_LINK =
  "absolute inset-0 grid place-items-center rounded-[25px] px-4 text-center text-xl font-medium no-underline [text-shadow:0_1px_3px_var(--background),0_0_12px_var(--background)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export default function HomePage() {
  return (
    <div className="grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {HOME_LINKS.map((value) => (
        <PixelCard key={value.to}>
          {value.static ? (
            // 站外/静态目录：整页跳转，不走 SPA 路由
            <a href={value.to} className={CARD_LINK}>
              {value.label}
            </a>
          ) : (
            <Link to={value.to} className={CARD_LINK}>
              {value.label}
            </Link>
          )}
        </PixelCard>
      ))}
    </div>
  );
}
