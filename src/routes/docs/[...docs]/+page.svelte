<script lang="ts">
	import type { Plugin } from 'svelte-exmarkdown';
	import Markdown from 'svelte-exmarkdown';
	import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
	import { createHighlighterCoreSync } from 'shiki/core';
	import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
	import ts from 'shiki/langs/typescript.mjs';
	import rust from 'shiki/langs/rust.mjs';
	import githubLight from 'shiki/themes/github-light.mjs';
	// import githubDark from 'shiki/themes/github-dark.mjs';

	let { data } = $props();
	let md = $derived(data.content);

	const shikiPlugin = {
		rehypePlugin: [
			rehypeShikiFromHighlighter,
			createHighlighterCoreSync({
				themes: [githubLight],
				langs: [ts, rust],
				engine: createJavaScriptRegexEngine()
			}),
			{ theme: 'github-light' }
		]
	} satisfies Plugin;
	const plugins: Plugin[] = [shikiPlugin];
</script>

<Markdown {md} {plugins} />
