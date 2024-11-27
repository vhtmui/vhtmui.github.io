<script>
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';
	import ZPreCode from './ZPreCode.svelte';

	import { getAstNode } from 'svelte-exmarkdown';

	let { children } = $props();

	const ast = getAstNode();

	let content = $state();

	let icon = $state('copy');
	let visibility = $state('hidden');
	let hint = $state('');
	let disabled = $state(false);

	async function copyContent() {
		try {
			await navigator.clipboard.writeText(content);
			icon = 'check';
			visibility = 'visible';
			hint = '复制!';
			disabled = true;

			setTimeout(() => {
				icon = 'copy';
				visibility = 'hidden';
				hint = '';
				disabled = false;
			}, 1800);
		} catch (err) {
			console.error('复制失败:', err);
		}
	}
</script>

<div class="codeContainer">
	<pre contenteditable="false" bind:innerText={content}><code
			class={$ast.children[0].properties?.class}><ZPreCode ast={$ast.children[0]}></ZPreCode></code
		></pre>
	<button {disabled} class="copyBtn" style="visibility: {visibility};" onclick={copyContent}>
		<span style="visibility: {visibility};" class="hint">{hint}</span>
		<ZIcon height="1.5rem" width="1.5rem" option={icon}></ZIcon>
	</button>
</div>

<style>
	:global .codeContainer {
		position: relative;
		background-color: var(--hljs-bg-color);
		border-radius: 4px;
		.copyBtn {
			background-color: unset;
			border: none;
			position: absolute;
			right: 8px;
			top: 4.5px;
			display: flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			padding: 0.2rem;
			opacity: 0.8;
			&:hover {
				cursor: pointer;
				path {
					stroke: var(--all-svg-hover-color);
					fill: var(--all-svg-hover-color);
				}
			}
			.hint {
				margin-left: 0.5rem;
				font-size: 0.8rem;
				color: white;
				background-color: rgba(0, 0, 0, 0.7);
				padding: 0.2rem 0.5rem;
				border-radius: 4px;
			}
		}
		&:hover {
			.copyBtn {
				visibility: visible !important;
			}
		}
		pre{
			
		}
		code.hljs {
			font-family: 'CascadiaMono';
			font-size: smaller;
			color: var(--hljs-text-color);
			padding: 0.5rem 2.5rem 0.5rem 1rem !important;
			width: fit-content;
			background-color: unset;
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
