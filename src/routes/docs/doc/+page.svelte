<script>
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import rehypeSlug from 'rehype-slug';
	import H1 from './H1.svelte';
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';

	/** @type {import('./$types').PageData} */
	let { data } = $props();


	const headingIdPlugin = {
		rehypePlugin: [rehypeSlug]
	};

	let md = $state('# hello world');
	const plugins = [gfmPlugin(), headingIdPlugin];
</script>

<Markdown md={data.mdContent} {plugins} />

<style>

</style>
