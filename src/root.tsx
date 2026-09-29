import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
import ThemeProvider from "@/components/custom/theme-provider";
import "./main.css";

/**
 * 首屏防闪烁：在 React 接管前先按偏好把 .dark 落到 <html> 上。
 * 原来写在 index.html 里，framework mode 下 HTML 骨架由这个 Layout 产出，就挪到这里。
 */
const THEME_SCRIPT = `(function(){try{var pref=localStorage.getItem("theme")||"system";var dark=pref==="dark"||(pref==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.classList.toggle("dark",dark);root.style.colorScheme=dark?"dark":"light";}catch(error){}})();`;

/** 根路由的 HTML 文档骨架 */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        <link
          rel="icon"
          type="image/svg+xml"
          href={`${import.meta.env.BASE_URL}favicon.svg`}
        />
        <meta title="Useless" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        {children}
        {/* getKey 用 pathname：否则同页内的 #hash 跳转会被当成新位置，滚动位置被重置回顶部 */}
        <ScrollRestoration getKey={(location) => location.pathname} />
        <Scripts />
      </body>
    </html>
  );
}

export const meta = () => [{ title: "Useless" }];

/** 主题与全局布局之外的根组件 */
export default function App() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}

/** 渲染期出错时的兜底页面（路由未匹配由 error-page 负责） */
export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "渲染出错";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="font-heading text-2xl font-semibold">{status}</h1>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
