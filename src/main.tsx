import "./main.css";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { createBrowserRouter } from "react-router";

import AppLayout from "./layouts/AppLayout";

import HomePage from "./pages/HomePage";
import DocsPage from "./pages/DocsPage";
import MacConverter from "./pages/MacConverterPage";
import ErrorPage from "./pages/ErrorPage";
import ToolsPage from "./pages/ToolsPage";

import { systemThemeChange } from "./components/ThemeSelector";
import { ROUTES } from "./config/links";

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

function SetTheme() {
  useEffect(() => {
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
