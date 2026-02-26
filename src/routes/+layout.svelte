<script>
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';

	import './layout.css';
	import Header from '$lib/components/my/Header.svelte';
	import * as Siderbar from '$lib/components/ui/sidebar';
	import GlobalSidebar from '$lib/components/my/GlobalSidebar.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />
<Siderbar.Provider>
	<GlobalSidebar></GlobalSidebar>
	<main>
		<Header />
		{@render children?.()}
	</main>
</Siderbar.Provider>
