<script>
	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { data, children } = $props();

	// displays.display = displays.displayToc = true;
</script>

{@render children()}
