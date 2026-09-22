import "./main.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { createBrowserRouter } from "react-router";

import ThemeProvider from "@/components/custom/theme-provider";
import AppLayout from "@/layouts/app-layout";
import { ROUTES } from "@/config/links";

import DocsPage from "@/pages/docs-page";
import ErrorPage from "@/pages/error-page";
import HomePage from "@/pages/home-page";
import MacConverter from "@/pages/mac-converter-page";
import ToolsPage from "@/pages/tools-page";
import PlaygroundPage from "@/pages/playground-page";

const router = createBrowserRouter([
  {
    path: ROUTES.home,
    Component: AppLayout,
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: HomePage },
      { path: ROUTES.docs, Component: DocsPage },
      {
        path: ROUTES.tools,
        children: [
          { index: true, Component: ToolsPage },
          { path: ROUTES.macConverter, Component: MacConverter },
        ],
      },
      { path: ROUTES.playground, Component: PlaygroundPage },
    ],
  },
  { path: "*", Component: ErrorPage },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
