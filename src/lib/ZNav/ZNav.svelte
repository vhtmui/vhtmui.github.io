<script>
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import ZBlurBtn from '$lib/ZBlurBtn/ZBlurBtn.svelte';
	import { onMount } from 'svelte';

	let urls = $state();

	onMount(() => {
		const url = new URL($page.url);
		urls = url.pathname.split('/').filter(Boolean);
	});

	afterNavigate(() => {
		const url = new URL($page.url);
		urls = url.pathname.split('/').filter(Boolean);
	});

	$inspect(urls);
</script>

<div class="znav">
	{#each urls as url, i}
		{#if i !== 0}
			<span>/</span>
		{/if}
		<a href={'/' + urls.slice(0, i + 1).join('/')}>{url}</a>
	{/each}
</div>

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
		a {
			font-size: large;
			font-weight: bolder;
			text-decoration: none;
			&:hover {
				text-decoration: solid underline;
				color: var(--header-text-hover-color);
			}
		}
		span{
			padding: 0 1rem;
		}
	}
</style>
