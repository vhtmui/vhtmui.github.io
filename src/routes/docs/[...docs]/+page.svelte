<script>
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';

	import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
	import rehypeSlug from 'rehype-slug';
	import rehypeToc from '@jsdevtools/rehype-toc';
	import rehypeAutoLinkHeadings from 'rehype-autolink-headings';
	import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
	import { createHighlighterCoreSync } from 'shiki/core';
	import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
	import ts from 'shiki/langs/typescript.mjs';
	import ps from 'shiki/langs/powershell.mjs';
	import rust from 'shiki/langs/rust.mjs';
	import slackDark from 'shiki/themes/slack-dark.mjs';
	import slackOchin from 'shiki/themes/slack-ochin.mjs';

	import { h1, h2, pre } from '$lib/components/my/md';

	let { data } = $props();
	let md = $derived(data.content);

	const linkSvg =
		'<svg xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 0.2em;" width="0.5em" height="0.5em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

	const shikiPlugin = {
		rehypePlugin: [
			rehypeShikiFromHighlighter,
			createHighlighterCoreSync({
				themes: [slackDark, slackOchin],
				langs: [ts, rust, ps],
				engine: createJavaScriptRegexEngine()
			}),
			{ themes: { light: 'slack-ochin', dark: 'slack-dark' } }
		]
	};

	/** @type {import('svelte-exmarkdown').Plugin[]} */
	const plugins = [
		gfmPlugin(),
		shikiPlugin,
		{ rehypePlugin: [rehypeSlug] },
		{ rehypePlugin: [rehypeToc] },
		{
			rehypePlugin: [
				rehypeAutoLinkHeadings,
				{
					content: fromHtmlIsomorphic(linkSvg, { fragment: true }).children
				}
			]
		}
	];
</script>

<article class="prose dark:prose-invert">
	<Markdown {md} {plugins} {h1} {h2} {pre}></Markdown>
</article>

<style>
	article {
		scroll-margin-top: 4rem;
		margin: 0 auto;
	}
</style>
