import PageHeader from "@/components/custom/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function DocsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Docs"
        description="文档内容将在这里渲染。"
      />
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardContent className="text-sm text-muted-foreground">
          <p>
            仓库根目录的 <code className="rounded bg-muted px-1 py-0.5">content/</code>{" "}
            目录保持原样，后续可接入 markdown 渲染并生成目录。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
