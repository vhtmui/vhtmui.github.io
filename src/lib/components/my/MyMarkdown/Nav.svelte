<script module>
	export const navFlagClass = 'vvvvvvvvvvvh';
</script>

<script>
	import { cn } from '$lib/utils';
	import { getAstNode } from 'svelte-exmarkdown';

	let { children, class: ClassName, ...restProps } = $props();

	const navAst = getAstNode();
	$inspect(navAst);
</script>

{#snippet node(child)}
	{#if child.type === 'element'}
		{@const { className, ...restProps } = child.properties || {}}
		<svelte:element this={child.tagName} class={className} {...restProps}>
			{#if child.children}
				{#each child.children as subChild, index (index)}
					{@render node(subChild)}
				{/each}
			{/if}
		</svelte:element>
	{:else if child.type === 'text'}
		{child.value}
	{/if}
{/snippet}

{#if !navAst.current.properties?.className?.includes(navFlagClass)}
	{@render children?.()}
{:else}
	<nav class={cn('not-prose', ClassName)} {...restProps}>
		{#each navAst.current.children as child, index (index)}
			{@render node(child)}
		{/each}
	</nav>
{/if}

<style>
</style>
