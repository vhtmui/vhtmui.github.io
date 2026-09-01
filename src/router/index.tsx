import { createBrowserRouter } from 'react-router'
import AppLayout from '../layouts/AppLayout'
import Home from '../pages/Home'
import DocsPage from '../pages/DocsPage'
import MacConverterPage from '../pages/MacConverterPage'
import TestPage from '../pages/TestPage'
import ErrorPage from '../pages/ErrorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: Home },
      { path: 'docs', Component: DocsPage },
      { path: 'mac-converter', Component: MacConverterPage },
      { path: 'testpage', Component: TestPage },
    ],
  },
  { path: '*', Component: ErrorPage },
])

export default router
