<script>
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import rehypeSlug from 'rehype-slug';
	// import rehypeHighlight from 'rehype-highlight';
	// import powershell from 'highlight.js/lib/languages/powershell';
	// import { common } from 'lowlight';
	// import 'highlight.js/styles/github.css';

	import ZCode from '$lib/ZCode/ZCode.svelte';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let md = $state('# hello world');
	const plugins = [
		{
			
			rehypePlugin: [rehypeSlug],
			// renderer: { code: ZCode }
		},
		// {
		// 	rehypePlugin: [rehypeHighlight, { languages: { ...common, powershell } }]
		// },
		gfmPlugin()
	];
	$inspect(data.content)
</script>

<Markdown md={data.content} {plugins} />

<style>
	:global {
		code {
			font-family: 'CascadiaMono';
		}
	}
</style>
