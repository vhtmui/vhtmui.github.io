<script>
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	// import rehypeSlug from 'rehype-slug';
	// import rehypeHighlight from 'rehype-highlight';
	// import powershell from 'highlight.js/lib/languages/powershell';
	// import { common } from 'lowlight';
	// import 'highlight.js/styles/github.css';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let md = $state('# hello world');
	const plugins = [gfmPlugin()];
</script>

<div class="markdown">
	<Markdown md={data.content} {plugins} />
</div>

<style>
</style>
