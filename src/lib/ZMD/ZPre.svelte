<script>
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';
	import ZCode from './ZPreCode.svelte';

	import { getAstNode } from 'svelte-exmarkdown';

	let { children } = $props();

	const ast = getAstNode();

	let content = $state();

	async function copyContent() {
        try {
            await navigator.clipboard.writeText(content);
        } catch (err) {
            console.error('复制失败:', err);
        }
    }
</script>

<div class="codeContainer">
	<pre contenteditable="false" bind:innerText={content}><code
			class={$ast.children[0].properties?.class}><ZCode ast={$ast.children[0]}></ZCode></code
		></pre>
	<button class="copyBtn" onclick={copyContent}><ZIcon height="1.5rem" width="1.5rem" option="copy"></ZIcon></button>
</div>

<style>
	.codeContainer :global {
		position: relative;
		.copyBtn {
			background-color: unset;
			border: none;
			position: absolute;
			right: 10px;
			top: 6.8px;
			display: flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			padding: 0.2rem;
			visibility: hidden;
			opacity: 0.8;
			&:hover {
				cursor: pointer;
				path {
					stroke: var(--all-svg-hover-color);
					fill: var(--all-svg-hover-color);
				}
			}
		}
		&:hover {
			.copyBtn {
				visibility: visible;
			}
		}
		code.hljs {
			font-family: 'CascadiaMono';
			font-size: smaller;
			color: var(--hljs-text-color);
			background-color: var(--hljs-bg-color);
			border-radius: 4px;
			padding: 0.5rem 1rem !important;
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
