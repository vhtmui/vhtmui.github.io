<script>
	import { getAstNode } from 'svelte-exmarkdown';

	const ast = getAstNode();
</script>

<code>
	{$ast.children[0].value}
</code>

<style>
	code {
		background-color: var(--md-code-color);
		padding: 2px;
		border-radius: 5px;
		font-family: 'CascadiaMono';
		font-weight: 100;
        font-size: smaller;
	}
</style>
