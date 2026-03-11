<script>
	import { cn } from '$lib/utils';
	import { getAstNode } from 'svelte-exmarkdown';

	let { children, class: ClassName, ...restProps } = $props();

	const navAst = getAstNode().current;
	$inspect(navAst);
</script>

{#snippet node(child)}
	{#if (child.type = 'element')}
		<svelte:element this={child.tagName}>
			{#if child.children}
				{#each child.children as subChild, index (index)}
					{@render node(subChild)}
				{/each}
			{/if}
		</svelte:element>
	{:else if (child.type = 'text')}
		{child.value}
	{/if}
{/snippet}

<nav class={cn('not-prose', ClassName)} {...restProps}>
	{#each navAst.children as child, index (index)}
		{@render node(child)}
	{/each}
</nav>
