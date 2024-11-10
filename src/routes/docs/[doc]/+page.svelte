<script>
	import Markdown from '$lib/Exmarkdown/Markdown.svelte';
	import { gfmPlugin } from '$lib/Exmarkdown/gfm';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let md = $state('# hello world');
	const plugins = [gfmPlugin()];
</script>

<Markdown md={data.mdContent} {plugins} />
