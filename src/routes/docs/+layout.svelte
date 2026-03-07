<script>
	import { Folder, FolderOpen } from '@lucide/svelte';
	import {
		GlobalSidebarMenuItem,
		setSidebarMenuItems,
		sb
	} from '$lib/components/my/GlobalSidebar/context.svelte';
	import { onDestroy } from 'svelte';

	/** @type {import('./$types').LayoutProps} */
	let { data, children } = $props();

	// set sidebar in docs layout
	const items = data.docItems.map((d) => {
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

	$effect(() =>
		sb.itemData?.forEach((/** @type {GlobalSidebarMenuItem} */ item) => {
			item.Icon = item.Icon ? (item.open ? FolderOpen : Folder) : null;
		})
	);
	onDestroy(() => (sb.itemData = null));
</script>

<div class="docs-layout">
	{@render children()}
</div>

<style>
	.docs-layout {
		padding: 1rem 1rem;
	}

	@media (min-width: 768px) {
		.docs-layout {
			padding: 1rem 2rem;
		}
	}

	@media (min-width: 1024px) {
		.docs-layout {
			padding: 1rem 3rem;
		}
	}
</style>
