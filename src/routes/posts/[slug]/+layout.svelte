<script>
    let { data, children } = $props();
</script>

<div class="layout">
	<main2>
		{@render children()}
	</main2>

	<aside>
		<h2>More posts</h2>
		<ul>
			{#each data.summaries as { slug, title }}
				<li>
					<a href="/posts/{slug}">{title}</a>
				</li>
			{/each}
		</ul>
	</aside>
</div>

<style>
	@media (min-width: 640px) {
		.layout {
			display: grid;
			gap: 2em;
			grid-template-columns: 1fr 16em;
		}
	}
</style>