import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import "./main.css";

import { themeChange } from "theme-change";
import { createBrowserRouter } from "react-router";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import DocsPage from "./pages/DocsPage";
import MacConverterPage from "./pages/MacConverterPage";
import TestPage from "./pages/TestPage";
import ErrorPage from "./pages/ErrorPage";
import { systemThemeChange } from "./components/ThemeSelector";

const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: Home },
      { path: "docs", Component: DocsPage },
      { path: "testpage", Component: TestPage },
      { path: "mac-converter", Component: MacConverterPage },
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
