import "./main.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { createBrowserRouter } from "react-router";

import ThemeProvider from "@/components/theme-provider";
import AppLayout from "@/layouts/AppLayout";
import { ROUTES } from "@/config/links";

import DocsPage from "@/pages/DocsPage";
import ErrorPage from "@/pages/ErrorPage";
import HomePage from "@/pages/HomePage";
import MacConverter from "@/pages/MacConverterPage";
import ToolsPage from "@/pages/ToolsPage";

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
