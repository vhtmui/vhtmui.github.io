<script>
	import ThemeToggle from './ThemeToggle.svelte';
	import Nav from './Nav.svelte';
	import SidebarTrigger from '$lib/components/ui/sidebar/sidebar-trigger.svelte';
</script>

<header
	class="sticky top-0 z-10 flex h-14 flex-row items-center border-b pr-4 pl-4 backdrop-blur-sm"
>
	<SidebarTrigger />
	<Nav />
	<ThemeToggle />
</header>
