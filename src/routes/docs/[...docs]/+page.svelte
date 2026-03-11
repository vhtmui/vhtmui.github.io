<script>
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';

	import rehypeSlug from 'rehype-slug';
	import rehypeToc from 'rehype-toc';
	import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
	import { createOnigurumaEngine } from 'shiki';
	import { createHighlighterCore } from 'shiki/core';

	import * as MD from '$lib/components/my/MyMarkdown';

	let { data } = $props();
	let md = $derived(data.content);

	const shikiPluginPromise = createHighlighterCore({
		themes: [import('shiki/themes/slack-dark.mjs'), import('shiki/themes/slack-ochin.mjs')],
		langs: [import('shiki/langs/rust.mjs')],
		engine: createOnigurumaEngine(import('shiki/wasm'))
	}).then((highlighter) => {
		return {
			rehypePlugin: [
				rehypeShikiFromHighlighter,
				highlighter,
				{ themes: { light: 'slack-ochin', dark: 'slack-dark' } }
			]
		};
	});

	/** @type {import('svelte-exmarkdown').Plugin} */
	const csPlugin = {
		renderer: { pre: MD.Pre, nav: MD.Nav }
	};

	/** @type {import('svelte-exmarkdown').Plugin[]} */
	const plugins = [
		gfmPlugin(),
		{ rehypePlugin: [rehypeSlug] },
		{
			rehypePlugin: [
				rehypeToc,
				{
					headings: ['h2', 'h3', 'h4', 'h5', 'h6'],
					cssClasses: {
						toc: MD.navFlagClass
					}
				}
			]
		},
		csPlugin
	];

	const csSnippetPlugin = {
		h1: MD.h1,
		h2: MD.h2
	};
</script>

<article class="prose dark:prose-invert">
	{#await shikiPluginPromise}
		<Markdown {md} {plugins} {...csSnippetPlugin} />
	{:then shikiPlugin}
		<Markdown {md} plugins={[shikiPlugin, ...plugins]} {...csSnippetPlugin} />
	{:catch}
		<Markdown {md} {plugins} {...csSnippetPlugin} />
	{/await}
</article>

<style>
	article {
		scroll-margin-top: 4rem;
		margin: 0 auto;
	}
</style>
