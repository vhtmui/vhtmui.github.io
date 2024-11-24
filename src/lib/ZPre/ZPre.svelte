<script>
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';

	import { getAstNode } from 'svelte-exmarkdown';

	let { children } = $props();

	const ast = getAstNode();

	$inspect($ast.children[0]);
</script>

<div>
	<pre><code>{#each $ast.children[0].children as co}{#if co.type === 'text'}{co.value}{:else if co.type === 'element' && co.tagName === 'span'}<span class={co.properties.class}>{co.children[0].value}</span>{/if}{/each}</code></pre>
	<div><ZIcon option="copy"></ZIcon></div>
</div>
