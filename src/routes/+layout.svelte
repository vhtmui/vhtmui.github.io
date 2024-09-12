<script>
	export let data;
</script>

<nav>
	<ul>
		{#each data.summaries as {slug, title} }
			<li><a href="/posts/{slug}">{title}</a></li>
		{/each}
	</ul>
</nav>

<slot></slot>
