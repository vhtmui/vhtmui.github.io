<script>
	import { getAstNode } from 'svelte-exmarkdown';

	let { children } = $props();

	const ast = getAstNode();
</script>

<img src="{$ast.properties.src.replace('static','')}" alt="{$ast.properties.alt}}"/>