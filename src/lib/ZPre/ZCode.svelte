<script>
	import ZCode from './ZCode.svelte';

	let { ast, props } = $props();

	$inspect(ast);
</script>

{#each ast.children as child}
	{#if child.type === 'text'}
		{child.value}
	{:else if child.type === 'element' && child.tagName === 'span'}
		<span class={child.properties.class}>
			{#if child.children.length > 0}
				<ZCode ast={child}></ZCode>
			{/if}
		</span>
	{/if}
{/each}
