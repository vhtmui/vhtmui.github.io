<script>
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';

	import './layout.css';
	import Header from '$lib/components/my/Header.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { GlobalSidebarTrigger, GlobalSidebar } from '$lib/components/my/GlobalSidebar';

	let { children } = $props();

	let lastScrollTop = $state(0); // 记录上一次的滚动位置
	let headerTop = $state(0);

	function handleScroll() {
		const currentScrollTop = window.scrollY;
		const scrollDelta = currentScrollTop - lastScrollTop;

		if (scrollDelta > 0 && headerTop > -56) {
			headerTop = Math.max(headerTop - scrollDelta, -56);
		} else if (scrollDelta < 0 && headerTop < 0) {
			headerTop = Math.min(headerTop - scrollDelta, 0);
		}

		lastScrollTop = currentScrollTop;
	}

	let sidebarRef = $state(null);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<svelte:window on:scroll={handleScroll} />

<ModeWatcher />

<Header top={headerTop} />
<Sidebar.Provider class="pt-14 wrap-break-word">
	{#if sidebarRef === null}
		<GlobalSidebarTrigger
			class="fixed top-[calc(50vh-32px)] h-16 w-6 rotate-180 rounded-sm opacity-90"
		/>
	{/if}
	<GlobalSidebar bind:ref={sidebarRef} top={headerTop + 56}></GlobalSidebar>
	<main class="content">
		{@render children?.()}
	</main>
</Sidebar.Provider>

<style>
	main.content {
		flex: 1;
		overflow-wrap: break-word;
		overflow-x: auto;
		:global(pre) {
			overflow-x: auto;
		}
	}
</style>
