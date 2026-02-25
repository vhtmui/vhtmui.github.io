<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

{#each data.docItems as dl}
	<p>{dl.relativePath}</p>
{/each}
