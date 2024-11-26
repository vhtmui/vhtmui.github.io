<script>
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import rehypeSlug from 'rehype-slug';
	import rehypeHighlight from 'rehype-highlight';
	import powershell from 'highlight.js/lib/languages/powershell';
	import { common } from 'lowlight';
	import 'highlight.js/styles/github.css';

	import ZPre from '$lib/ZMD/ZPre.svelte';
	import ZCode from '$lib/ZMD/ZCode.svelte';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let md = $state('# hello world');
	const plugins = [
		{
			rehypePlugin: [rehypeSlug],
			renderer: { pre: ZPre, code: ZCode }
		},
		{
			rehypePlugin: [rehypeHighlight, { languages: { ...common, powershell } }]
		},
		gfmPlugin()
	];
</script>

<Markdown md={data.content} {plugins} />

<style>
</style>
