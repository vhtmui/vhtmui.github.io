import "./main.css";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { themeChange } from "theme-change";
import { createBrowserRouter } from "react-router";

import AppLayout from "./layouts/AppLayout";

import HomePage from "./pages/Home";
import DocsPage from "./pages/DocsPage";
import MacConverter from "./pages/MacConverterPage";
import ErrorPage from "./pages/ErrorPage";
import ToolsPage from "./pages/ToolsPage";

import { systemThemeChange } from "./components/ThemeSelector";

const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: HomePage },
      { path: "docs", Component: DocsPage },
      {
        path: "tools",
        children: [
          { index: true, Component: ToolsPage },
          { path: "mac-converter", Component: MacConverter },
        ],
      },
    ],
  },
  { path: "*", Component: ErrorPage },
]);

function SetTheme() {
  useEffect(() => {
    themeChange(false);
    systemThemeChange();
  }, []);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SetTheme />
    <RouterProvider router={router} />
  </StrictMode>,
);
