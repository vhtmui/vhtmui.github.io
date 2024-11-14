<script>
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import rehypeSlug from 'rehype-slug';
	import H1 from './H1.svelte';
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let c = $state('sun');

	if (data.c === 'Dark') {
		c = 'moon';
	}

	const headingIdPlugin = {
		rehypePlugin: [rehypeSlug]
	};

	let md = $state('# hello world');
	const plugins = [gfmPlugin(), headingIdPlugin];
</script>

<div>
	<H1 h={data.h1}></H1>
	<H1 h={data.c}></H1>
	<ZIcon option={c}></ZIcon>
</div>
<Markdown md={data.mdContent} {plugins} />

<style>
	div :global{
		svg *{
			fill:var(--all-svg-color);
		}
	}
</style>
