<script>
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';

	import rehypeSlug from 'rehype-slug';
	import rehypeToc from 'rehype-toc';
	import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
	import { createHighlighterCoreSync } from 'shiki/core';
	import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
	import ts from 'shiki/langs/typescript.mjs';
	import ps from 'shiki/langs/powershell.mjs';
	import rust from 'shiki/langs/rust.mjs';
	import slackDark from 'shiki/themes/slack-dark.mjs';
	import slackOchin from 'shiki/themes/slack-ochin.mjs';

	import * as MD from '$lib/components/my/MyMarkdown';

	let { data } = $props();
	let md = $derived(data.content);

	/** @type {import('svelte-exmarkdown').Plugin} */
	const csPlugin = {
		renderer: { pre: MD.Pre, nav: MD.Nav}
	};

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
		{
			rehypePlugin: [rehypeToc]
		},
		csPlugin
	];
</script>

<article class="prose dark:prose-invert">
	<Markdown {md} {plugins} h1={MD.h1} h2={MD.h2}></Markdown>
</article>

<style>
	article {
		scroll-margin-top: 4rem;
		margin: 0 auto;
	}
</style>
