<script>
	import ThemeToggle from './ThemeToggle.svelte';
	import Nav from './Nav.svelte';

	let { top = $bindable(0) } = $props();
</script>

<header
	class="bg-background fixed z-11 flex h-14 flex-row items-center gap-2 border-b pr-2 pl-2"
	style="top: {top}px"
>
	<Nav />
	<ThemeToggle />
</header>

<style>
	header {
		width: 100%;
	}
</style>
