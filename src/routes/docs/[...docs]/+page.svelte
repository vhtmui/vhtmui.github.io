<script lang="ts">
	import type { Plugin } from 'svelte-exmarkdown';
	import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
	import Markdown from 'svelte-exmarkdown';
	import rehypeSlug from 'rehype-slug';
	import rehypeToc from '@jsdevtools/rehype-toc';
	import rehypeAutoLinkHeadings from 'rehype-autolink-headings';
	import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
	import { createHighlighterCoreSync } from 'shiki/core';
	import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
	import ts from 'shiki/langs/typescript.mjs';
	import rust from 'shiki/langs/rust.mjs';
	import githubLight from 'shiki/themes/github-light.mjs';
	import githubDark from 'shiki/themes/github-dark.mjs';
	import 'github-markdown-css/github-markdown.css';

	import '$lib/components/my/md/style.css';
	import { h1 } from '$lib/components/my/md';

	let { data } = $props();
	let md = $derived(data.content);

	const linkSvg =
		'<svg xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 0.2em;" width="0.5em" height="0.5em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

	const shikiPlugin = {
		rehypePlugin: [
			rehypeShikiFromHighlighter,
			createHighlighterCoreSync({
				themes: [githubLight, githubDark],
				langs: [ts, rust],
				engine: createJavaScriptRegexEngine()
			}),
			{ themes: { light: 'github-light', dark: 'github-dark' } }
		]
	} satisfies Plugin;
	const plugins: Plugin[] = [
		shikiPlugin,
		{ rehypePlugin: [rehypeSlug] },
		{ rehypePlugin: [rehypeToc] },
		{
			rehypePlugin: [
				rehypeAutoLinkHeadings,
				{
					content: /** @type {Array<ElementContent>} */ (
						fromHtmlIsomorphic(linkSvg, { fragment: true }).children
					)
				}
			]
		}
	];
</script>

<div class="markdown-body">
	<Markdown {md} {plugins} {h1}></Markdown>
</div>

<style>
	.markdown-body {
		box-sizing: border-box;
		min-width: 200px;
		max-width: 980px;
		margin: 0 auto;
		padding: 45px;
	}

	@media (max-width: 767px) {
		.markdown-body {
			padding: 15px;
		}
	}

	@media (prefers-color-scheme: dark) {
		.markdown-body {
			background-color: #0d1117;
		}
	}
</style>
