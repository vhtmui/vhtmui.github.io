<script>
	import { Folder, FolderOpen } from '@lucide/svelte';
	import {
		GlobalSidebarMenuItem,
		createSidebarMenuItems,
		sbNode
	} from '$lib/components/my/GlobalSidebar.svelte';

	/** @type {import('./$types').LayoutProps} */
	let { data, children } = $props();

	let items = $derived(
		data.docItems.map((d) => {
			const icon = d.isDirectory ? Folder : null;
			const item = new GlobalSidebarMenuItem(
				d.relativePath.replace('.md', ''),
				d.name.replace('.md', ''),
				d.relativePath.replace('.md', ''),
				icon
			);
			return item;
		})
	);

	$effect(() => {
		sbNode.data = createSidebarMenuItems(items, 'docs');

		return () => {
			sbNode.data = null;
		};
	});
</script>

{@render children()}
