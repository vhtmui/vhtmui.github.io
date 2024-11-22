<script>
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import ZBlurBtn from '$lib/ZBlurBtn/ZBlurBtn.svelte';
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';
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
</script>

<div class="znav">
	{#each urls as url, i}
		{#if i !== 0 && urls.length !== 0}
			<span>/</span>
		{/if}
		<a href={'/' + urls.slice(0, i + 1).join('/')}>{url}</a>
	{/each}
</div>

<style>
	.znav :global {
		display: flex;
		padding: 0 0.5rem;
		height: 3rem;
		min-width: 3rem;
		align-items: center;
		justify-content: center;
		flex-wrap: nowrap;
		flex-direction: row;
		border-radius: 0.7rem;
		backdrop-filter: blur(5px);
		background-color: var(--header-btn-bg-color);
		* {
			color: var(--header-text-color);
		}
		a {
			font-size: 0.9rem;
			text-decoration: none;
			color: var(--header-text-light-color);
			text-transform: capitalize;
			&:hover {
				text-decoration: solid underline;
				color: var(--header-text-hover-color);
			}
		}
		span {
			color: var(--header-text-light-color);
			padding: 0 0.5rem;
		}
	}
</style>
