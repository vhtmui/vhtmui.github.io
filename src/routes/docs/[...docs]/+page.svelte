<script lang="ts">
	import type { Plugin } from 'svelte-exmarkdown';
	import Markdown from 'svelte-exmarkdown';
	import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
	import { createHighlighterCoreSync } from 'shiki/core';
	import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
	import ts from 'shiki/langs/typescript.mjs';
	import rust from 'shiki/langs/rust.mjs';
	import githubLight from 'shiki/themes/github-light.mjs';
	import githubDark from 'shiki/themes/github-dark.mjs';
	import '$lib/components/my/md/style.css';

	let { data } = $props();
	let md = $derived(data.content);

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
	const plugins: Plugin[] = [shikiPlugin];
</script>

<Markdown {md} {plugins} />
