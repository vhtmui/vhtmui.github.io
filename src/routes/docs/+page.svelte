<script>
	import { resolve } from '$app/paths';
	import { formatUrl } from '$lib/my-utils';
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<ul>
	{#each data.docItems as dl (dl.relativePath)}
		<li>
			<a href={resolve(formatUrl(dl.relativePath.replace('.md', '')))}
				>{dl.name.replace('.md', '')}</a
			>
		</li>
	{/each}
</ul>

<a href={resolve('/docs/test')}>test</a>
