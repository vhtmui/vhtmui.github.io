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
      {/* 背景由全局 SiteBackground 提供，这里保持透明 */}
      <section className="rounded-2xl ring-1 ring-foreground/10">
        <div className="flex flex-col items-start gap-4 px-6 py-20 sm:px-10">
          <span className="rounded-full border bg-background/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
            shadcn + react-bits
          </span>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            把复杂的东西拆成能用的零件
          </h1>
          <p className="max-w-xl text-pretty text-muted-foreground">
            文档、工具与随手记。整套界面由 shadcn/ui 与 react-bits
            组成，支持明暗主题与移动端。
          </p>
          <div className="flex flex-wrap gap-2">
            <Button nativeButton={false} render={<Link to={ROUTES.docs} />}>
              浏览文档
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to={ROUTES.tools} />}
            >
              打开工具
            </Button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-medium">入口</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_LINKS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              reloadDocument={card.static}
              className="group rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Card className="h-full bg-card/60 backdrop-blur-sm transition-all group-hover:ring-primary/30 group-hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    {card.label}
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </CardTitle>
                  <CardDescription>
                    {card.static ? "静态资源目录" : "站内页面"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
