<script>
	let { data } = $props();
</script>

<h1>blog</h1>

<ul>
	{#each data.summaries as { slug, title }}
		<li><a href="/Posts/{slug}">{title}</a></li>
	{/each}
</ul>