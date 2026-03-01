<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

{#each data.docItems as dl}
	<a href={dl.relativePath.replace('.md', '')}>{dl.name.replace('.md', '')}</a>
{/each}
