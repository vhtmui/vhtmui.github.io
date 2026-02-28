<script>
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { House } from '@lucide/svelte';
	import {
		GlobalSidebarMenuItem,
		createSidebarMenuItems,
		sbNode
	} from '$lib/components/my/GlobalSidebar.svelte';

	/** @type {import('./$types').LayoutProps} */
	let { data, children } = $props();

	let items = $state(
		data.docItems.map((d) => {
			return new GlobalSidebarMenuItem(
				d.relativePath.replace('.md', ''),
				d.name.replace('.md', ''),
				d.relativePath.replace('.md', ''),
				House
			);
		})
	);

	sbNode.data = createSidebarMenuItems(items, 'docs');
</script>

{#each data.docItems as d}
	<p>{d.relativePath}</p>
{/each}
{@render children()}
