<script>
	import { page } from '$app/state';
	import Button from '@ui/button/button.svelte';
</script>

<div>
	<h1>{page.status}: {page.error.message}</h1>
	<Button href="/" variant='outline'>Go back</Button>
</div>

<style>
	div {
		height: 80vh;
		display: flex;
		flex-direction: column;
        gap: 1rem;
		align-items: center;
		justify-content: center;
	}
</style>
