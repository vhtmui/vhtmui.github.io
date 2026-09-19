import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES, STATIC_PATHS } from "@/config/links";

/** 首页入口卡片 */
const HOME_LINKS = [
  { to: ROUTES.docs, label: "Docs" },
  { to: ROUTES.macConverter, label: "MAC Address Converter" },
  { to: STATIC_PATHS.dufs, label: "Dufs", static: true },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <h1>Hello</h1>
    </div>
  );
}
