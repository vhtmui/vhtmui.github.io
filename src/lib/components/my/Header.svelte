<script>
	import ThemeToggle from './ThemeToggle.svelte';
	import Nav from './Nav.svelte';
	import SidebarTrigger from '$lib/components/ui/sidebar/sidebar-trigger.svelte';
</script>

<header
	class="sticky top-0 z-10 flex flex-row gap-2 h-14 items-center border-b pr-2 pl-2 backdrop-blur-sm"
>
	<SidebarTrigger variant="ghost" size="icon" />
	<Nav />
	<ThemeToggle />
</header>
