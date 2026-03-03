<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<ul>
	{#each data.docItems as dl}
		<li>
			<a href={dl.relativePath.replace('.md', '')}>{dl.name.replace('.md', '')}</a>
		</li>
	{/each}
</ul>
