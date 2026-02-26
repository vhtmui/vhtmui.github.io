<script>
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { House } from '@lucide/svelte';

	/** @type {import('./$types').LayoutProps} */
	let { data, children } = $props();
</script>


{#each data.docItems as d}
	<p>{d.relativePath}</p>
{/each}
{@render children()}
