<script>
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import rehypeSlug from 'rehype-slug';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	const headingIdPlugin = {
		rehypePlugin: [rehypeSlug]
	};

	let md = $state('# hello world');
	const plugins = [gfmPlugin(),headingIdPlugin];
</script>

<Markdown md={data.mdContent} {plugins} />
