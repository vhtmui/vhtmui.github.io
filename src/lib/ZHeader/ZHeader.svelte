<script>

	let { children, ...others } = $props();

	let fns = Object.keys(others);
</script>

<div id="rootHead">
	{@render children?.()}

	{#each others as other}
		{@render others.sibarBtn()}	
	{/each}
</div>

<style>
	div#rootHead {
		display: flex;
		flex-direction: row;
	}
</style>
