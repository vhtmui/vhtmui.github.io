<script>
	import { SvelteMap } from "svelte/reactivity";

	let { children, ...others } = $props();

	let fns = Object.values(others);

	let snippets = $state(new Map());

	snippets = fns.map((fn,index) => ({
		fn: fn,
		ele:null,
		order:index,
		position:{
			start:0,
			length:0
		}
	}));
	$inspect(snippets[1].position.length)
</script>

<div id="rootHead">
	{#each snippets as snippet}
		<div class="headItem" bind:this={snippet.ele} bind:clientWidth={snippet.position.length}>
			{@render snippet.fn()}
		</div>
	{/each}
</div>

<style>
	div#rootHead {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 100%;
		.headItem {
			position: absolute;
		}
	}
</style>
