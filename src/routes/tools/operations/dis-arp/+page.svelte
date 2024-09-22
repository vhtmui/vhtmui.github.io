<script>
	import { draw } from 'svelte/transition';
	import { expoInOut } from 'svelte/easing';

    let condition =true;

</script>

<button on:click={()=>condition = !condition}>switch</button>

<svg viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg">
	{#if condition}
		<path
			transition:draw={{ duration: 1000, delay: 100, easing: expoInOut }}
			d="M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z"
			fill="none"
			stroke="cornflowerblue"
			stroke-width="0.1px"
			stroke-linejoin="round"
		/>
	{/if}
</svg>