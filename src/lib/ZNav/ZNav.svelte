<script>
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import ZBlurBtn from '$lib/ZBlurBtn/ZBlurBtn.svelte';
	import { onMount } from 'svelte';

	let url = $state('/');

	onMount(() => {});

	afterNavigate(() => {
		url = new URL($page.url);
	});

	$inspect(url);
</script>

<span class="znav">
	<!-- <ZBlurBtn style="width:max-content;"> -->
	Auto
	<!-- </ZBlurBtn> -->
</span>

<style>
	.znav :global {
		display: flex;
		height: 3rem;
		min-width: 3rem;
		align-items: center;
		justify-content: center;
		flex-wrap: nowrap;
		flex-direction: row;
		* {
			color: var(--header-text-color);
		}
	}
</style>
