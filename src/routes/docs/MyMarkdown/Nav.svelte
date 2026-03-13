<script module>
	export const navFlagClass = 'vvvvvvvvvvvh';
</script>

<script>
	import { cn } from '$lib/utils';
	import { getAstNode } from 'svelte-exmarkdown';

	let { children, class: ClassName, ...restProps } = $props();

	const navAst = getAstNode();

	let activeHref = $state(null);
</script>

{#snippet node(child)}
	{#if child.type === 'element'}
		{@const { className, ...restProps } = child.properties || {}}
		{@const csn = cn(className, className?.includes('toc-level-1') ? 'menu' : '')}
		<svelte:element this={child.tagName === 'ol' ? 'ul' : child.tagName} class={csn} {...restProps}>
			{#if child.tagName === 'li'}
				{#if child.children.length > 1}
					<details>
						<summary>
							{@render node(child.children[0])}
						</summary>
						{#each child.children.slice(1) as subChild, index (index)}
							{@render node(subChild)}
						{/each}
					</details>
				{:else if child.children.length === 1}
					{@render node(child.children[0])}
				{/if}
			{:else}
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
	<nav class={cn('not-prose', ClassName, navAst.current.properties.className)} {...restProps}>
		{#each navAst.current.children as child, index (index)}
			{@render node(child)}
		{/each}
	</nav>
{/if}

<style>
	nav {
		scrollbar-width: thin;
		scrollbar-gutter: stable;
	}
	ul.toc-level-1 {
		width: 100%;
	}
</style>
