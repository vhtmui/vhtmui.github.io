import { Wrench } from "lucide-react";
import { Link } from "react-router";
import PageHeader from "@/components/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/links";

export default function ToolsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Tools" description="一些自用的小工具。" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to={ROUTES.macConverter}
          className="group rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Card className="h-full bg-card/60 backdrop-blur-sm transition-all group-hover:ring-primary/30 group-hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="size-4 text-muted-foreground" />
                MAC Address Converter
              </CardTitle>
              <CardDescription>
                在多种 MAC 地址书写格式之间转换。
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
