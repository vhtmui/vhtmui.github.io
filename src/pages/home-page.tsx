import { ROUTES, STATIC_PATHS } from "@/config/links";

/** 首页入口卡片 */
const HOME_LINKS = [
  { to: ROUTES.docs, label: "Docs" },
  { to: ROUTES.macConverter, label: "MAC Address Converter" },
  { to: STATIC_PATHS.dufs, label: "Dufs", static: true },
];

export default function HomePage() {
  return <h1>Hello</h1>;
}
