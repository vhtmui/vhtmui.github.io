<script>
	import ZPreCode from './ZPreCode.svelte';

	let { ast, props } = $props();
</script>


	{#each ast?.children as child}
		{#if child.type === 'text'}
			{child.value}
		{:else if child.type === 'element' && child.tagName === 'span'}
			<span class={child.properties?.class}>
				{#if child?.children?.length > 0}
					<ZPreCode ast={child} />
				{/if}
			</span>
		{/if}
	{/each}


<style>
</style>