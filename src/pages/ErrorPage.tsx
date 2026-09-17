import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import SiteBackground from "@/components/site-background";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/links";

export default function ErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "Unknown error";

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <SiteBackground />
      <p className="font-heading text-5xl font-semibold tracking-tight">
        {notFound ? "404" : "Oops!"}
      </p>
      <p className="text-muted-foreground">
        {notFound ? "页面不存在。" : "发生了意外错误。"}
      </p>
      <code className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
        {message}
      </code>
      <Button nativeButton={false} render={<Link to={ROUTES.home} />}>
        回到首页
      </Button>
    </div>
  );
}
