import { Link } from "react-router";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/links";

export default function MacConverterPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="MAC Address Converter" description="格式转换工具。">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to={ROUTES.tools} />}
        >
          返回工具列表
        </Button>
      </PageHeader>
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardContent className="text-sm text-muted-foreground">
          <p>TODO: 实现 MAC 地址格式转换。</p>
        </CardContent>
      </Card>
    </div>
  );
}
