import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { getBasePath } from './lib/my-utils.js';
import RootLayout from './routes/root-layout.jsx';
import Home from './routes/home.jsx';
import MacConverter from './routes/mac-converter.jsx';
import TestPage from './routes/testpage.jsx';
import NotFound from './routes/not-found.jsx';
import DocsLayout from './routes/docs/docs-layout.jsx';
import DocsIndex from './routes/docs/docs-index.jsx';
import DocsSplat from './routes/docs/docs-splat.jsx';

const rootRoute = createRootRoute({
	component: RootLayout,
	notFoundComponent: NotFound
});

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });

const macConverterRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/mac-converter',
	component: MacConverter
});

const testPageRoute = createRoute({ getParentRoute: () => rootRoute, path: '/testpage', component: TestPage });

const docsLayoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/docs', component: DocsLayout });

const docsIndexRoute = createRoute({ getParentRoute: () => docsLayoutRoute, path: '/', component: DocsIndex });

// catch-all：/docs/xxx（任意层级），对应原项目 [...docs]
const docsSplatRoute = createRoute({ getParentRoute: () => docsLayoutRoute, path: '$', component: DocsSplat });

const routeTree = rootRoute.addChildren([
	homeRoute,
	macConverterRoute,
	testPageRoute,
	docsLayoutRoute.addChildren([docsIndexRoute, docsSplatRoute])
]);

export const router = createRouter({
	routeTree,
	basepath: getBasePath(),
	defaultPreload: false,
	scrollRestoration: true
});

export { routeTree };
