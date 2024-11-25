<script>
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';
	import ZCode from './ZCode.svelte';

	import { getAstNode } from 'svelte-exmarkdown';

	let { children } = $props();

	const ast = getAstNode();

	// $inspect($ast.children[0].children[0]);
</script>

<div>
	<pre><code class="{$ast.children[0].properties.class}"><ZCode ast={$ast.children[0]}></ZCode></code></pre>
	<div><ZIcon option="copy"></ZIcon></div>
</div>
