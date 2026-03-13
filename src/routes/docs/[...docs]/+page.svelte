<script>
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';

	import rehypeSlug from 'rehype-slug';
	import rehypeToc from 'rehype-toc';
	import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
	import { createOnigurumaEngine } from 'shiki';
	import { createHighlighterCore } from 'shiki/core';

	import * as MD from '../MyMarkdown/index.js';

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

<div class="doc-container">
	<article class="prose dark:prose-invert">
		{#await shikiPluginPromise}
			<Markdown {md} {plugins} {...csSnippetPlugin} />
		{:then shikiPlugin}
			<Markdown {md} plugins={[shikiPlugin, ...plugins]} {...csSnippetPlugin} />
		{:catch}
			<Markdown {md} {plugins} {...csSnippetPlugin} />
		{/await}
	</article>
	<div class="toc-holder" aria-hidden="true"></div>
</div>

<style>
	.doc-container {
		display: flex;
		flex-direction: row;
		width: 100%;
	}

	article {
		flex: 1;
		min-width: 0;
		max-width: 100%;
		padding: 0 2rem;
	}

	.toc-holder {
		flex: 0 0 300px;
		width: 300px;
		min-width: 300px;
	}

	:global(.vvvvvvvvvvvh) {
		position: fixed;
		right: 0;
		top: 4rem;
		bottom: 4rem;
		width: 300px;
		max-height: calc(100vh - 8rem);
		overflow-y: auto;
		padding: 1rem;
		z-index: 10;
	}

	@media (min-width: 1280px) {
	}

	@media (max-width: 768px) {
		article {
			padding: 0 2rem;
		}
		:global(.vvvvvvvvvvvh) {
			position: static;
			width: 100%;
			max-height: none;
			padding: 0;
			margin-bottom: 2rem;
			border-bottom: 1px solid var(--border);
		}
		.toc-holder {
			display: none;
		}
	}
</style>
