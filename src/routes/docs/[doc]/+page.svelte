<script>
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import rehypeSlug from 'rehype-slug';
	import rehypeHighlight from 'rehype-highlight';
	import powershell from 'highlight.js/lib/languages/powershell';
	import { common } from 'lowlight';
	import 'highlight.js/styles/github.css';

	import ZPre from '$lib/ZPre/ZPre.svelte';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let md = $state('# hello world');
	const plugins = [
		{
			rehypePlugin: [rehypeSlug],
			renderer: { pre: ZPre }
		},
		{
			rehypePlugin: [rehypeHighlight, { languages: { ...common, powershell } }]
		},
		gfmPlugin()
	];
</script>

<Markdown md={data.content} {plugins} />

<style>
	:global {
		code.hljs {
			font-family: 'CascadiaMono';
			color: var(--hljs-text-color);
			background-color: var(--hljs-bg-color);
			border-radius: 8px;
			.hljs-doctag,
			.hljs-keyword,
			.hljs-meta .hljs-keyword,
			.hljs-template-tag,
			.hljs-template-variable,
			.hljs-type,
			.hljs-variable.language_ {
				/* prettylights-syntax-keyword */
				color: var(--hljs-keyword);
			}
			.hljs-title,
			.hljs-title.class_,
			.hljs-title.class_.inherited__,
			.hljs-title.function_ {
				/* prettylights-syntax-entity */
				color: var(--hljs-title);
			}
			.hljs-attr,
			.hljs-attribute,
			.hljs-literal,
			.hljs-meta,
			.hljs-number,
			.hljs-operator,
			.hljs-variable,
			.hljs-selector-attr,
			.hljs-selector-class,
			.hljs-selector-id {
				/* prettylights-syntax-constant */
				color: var(--hljs-attr);
			}
			.hljs-regexp,
			.hljs-string,
			.hljs-meta .hljs-string {
				/* prettylights-syntax-string */
				color: var(--hljs-string);
			}
			.hljs-built_in,
			.hljs-symbol {
				/* prettylights-syntax-variable */
				color: var(--hljs-symbol);
			}
			.hljs-comment,
			.hljs-code,
			.hljs-formula {
				/* prettylights-syntax-comment */
				color: var(--hljs-comment);
			}
			.hljs-name,
			.hljs-quote,
			.hljs-selector-tag,
			.hljs-selector-pseudo {
				/* prettylights-syntax-entity-tag */
				color: var(--hljs-name);
			}
			.hljs-subst {
				/* prettylights-syntax-storage-modifier-import */
				color: var(--hljs-subst);
			}
			.hljs-section {
				/* prettylights-syntax-markup-heading */
				color: #005cc5;
				font-weight: bold;
			}
			.hljs-bullet {
				/* prettylights-syntax-markup-list */
				color: #735c0f;
			}
			.hljs-emphasis {
				/* prettylights-syntax-markup-italic */
				color: #24292e;
				font-style: italic;
			}
			.hljs-strong {
				/* prettylights-syntax-markup-bold */
				color: #24292e;
				font-weight: bold;
			}
			.hljs-addition {
				/* prettylights-syntax-markup-inserted */
				color: #22863a;
				background-color: #f0fff4;
			}
			.hljs-deletion {
				/* prettylights-syntax-markup-deleted */
				color: #b31d28;
				background-color: #ffeef0;
			}
			.hljs-char.escape_,
			.hljs-link,
			.hljs-params,
			.hljs-property,
			.hljs-punctuation,
			.hljs-tag {
				/* purposely ignored */
				
			}
		}
	}
</style>
