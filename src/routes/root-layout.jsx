import { useEffect, useRef, useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import * as Sidebar from '@ui/sidebar.jsx';
import Header from '@my/Header.jsx';
import { GlobalSidebar, GlobalSidebarTrigger } from '@my/GlobalSidebar/index.js';

/** 对应原项目 src/routes/+layout.svelte */
export default function RootLayout() {
	const lastScrollTop = useRef(0);
	const [headerTop, setHeaderTop] = useState(0);
	const [sidebarMounted, setSidebarMounted] = useState(false);

	useEffect(() => {
		function handleScroll() {
			const currentScrollTop = window.scrollY;
			const scrollDelta = currentScrollTop - lastScrollTop.current;

			if (scrollDelta > 0) {
				setHeaderTop((h) => (h > -56 ? Math.max(h - scrollDelta, -56) : h));
			} else if (scrollDelta < 0) {
				setHeaderTop((h) => (h < 0 ? Math.min(h - scrollDelta, 0) : h));
			}

			lastScrollTop.current = currentScrollTop;
		}

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		setSidebarMounted(true);
	}, []);

	return (
		<>
			<Header top={headerTop} />
			<Sidebar.Provider className="pt-14 wrap-break-word">
				{!sidebarMounted && (
					<GlobalSidebarTrigger className="fixed top-[calc(50vh-32px)] h-16 w-6 rotate-180 rounded-sm opacity-90" />
				)}
				<GlobalSidebar top={headerTop + 56} />
				<main className="content">
					<Outlet />
				</main>
			</Sidebar.Provider>
		</>
	);
}
