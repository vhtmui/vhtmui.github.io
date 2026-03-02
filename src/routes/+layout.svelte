<script>
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import SidebarTrigger from '$lib/components/ui/sidebar/sidebar-trigger.svelte';

	import './layout.css';
	import Header from '$lib/components/my/Header.svelte';
	import * as Siderbar from '$lib/components/ui/sidebar';
	import GlobalSidebar from '$lib/components/my/GlobalSidebar/GlobalSidebar.svelte';

	let { children } = $props();

	let lastScrollTop = $state(0); // 记录上一次的滚动位置
	let headerTop = $state(0); // 初始化 headerTop 为 -56

	function handleScroll() {
		const currentScrollTop = window.scrollY;
		const scrollDelta = currentScrollTop - lastScrollTop;
		console.log('scrollDelta', scrollDelta);

		// 向下滚动时增加 headerTop，但不超过 0
		if (scrollDelta > 0 && headerTop > -56) {
			headerTop = Math.max(headerTop - scrollDelta, -56);
		}
		// 向上滚动时减少 headerTop，但不小于 -56
		else if (scrollDelta < 0 && headerTop < 0) {
			headerTop = Math.min(headerTop - scrollDelta, 0);
		}

		lastScrollTop = currentScrollTop; // 更新上一次的滚动位置
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<svelte:window on:scroll={handleScroll} />

<ModeWatcher />

<Header top={headerTop} />
<Siderbar.Provider class="pt-14">
	<GlobalSidebar top={headerTop + 56}></GlobalSidebar>
	<div class="content">
		{@render children?.()}
	</div>
</Siderbar.Provider>

<style>
	main {
		display: flex;
		width: 100%;
		position: sticky;
		top: 0;
	}
	div.content {
		width: 100%;
	}
</style>
