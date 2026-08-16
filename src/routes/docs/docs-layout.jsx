import { useEffect } from 'react';
import { Outlet } from '@tanstack/react-router';
import { FolderOpen, Folder } from 'lucide-react';
import { docItems } from '@lib/docs.js';
import { GlobalSidebarMenuItem, setSidebarMenuItems, clearSidebarMenuItems } from '@my/GlobalSidebar/context.js';

/** 对应原项目 src/routes/docs/+layout.svelte */
export default function DocsLayout() {
	useEffect(() => {
		// set sidebar in docs layout
		const items = docItems.map((d) => {
			const path = d.relativePath.replace('.md', '');
			const label = d.name.replace('.md', '');
			const href = d.relativePath.replace('.md', '');
			const open = true;
			const Icon = d.isDirectory ? (open ? FolderOpen : Folder) : null;
			const highlight = false;
			const item = new GlobalSidebarMenuItem(path, label, href, Icon, open, highlight);
			return item;
		});

		setSidebarMenuItems(items, 'docs');

		return () => {
			clearSidebarMenuItems();
		};
	}, []);

	return (
		<div className="docs-layout" style={{ minWidth: 0 }}>
			<Outlet />
		</div>
	);
}
