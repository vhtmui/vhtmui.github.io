<script>
	import { Folder, FolderOpen } from '@lucide/svelte';
	import {
		GlobalSidebarMenuItem,
		setSidebarMenuItems,
		sb
	} from '$lib/components/my/GlobalSidebar/context.svelte';

	/** @type {import('./$types').LayoutProps} */
	let { data, children } = $props();

	// set sidebar in docs layout
	let items = data.docItems.map((d) => {
		const path = d.relativePath.replace('.md', '');
		const label = d.name.replace('.md', '');
		const href = d.relativePath.replace('.md', '');
		const open = true;
		const icon = d.isDirectory ? (open ? FolderOpen : Folder) : null;
		const highlight = false;
		const item = new GlobalSidebarMenuItem(path, label, href, icon, open, highlight);
		return item;
	});

	setSidebarMenuItems(items, 'docs');

	$effect(() => {
		sb.itemData.forEach((/** @type {GlobalSidebarMenuItem} */ item) => {
			item.icon = item.icon ? (item.open ? FolderOpen : Folder) : null;
		});

		return () => {
			sb.itemData = null;
		};
	});
</script>

{@render children()}
