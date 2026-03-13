<script lang="ts">
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	import { toggleMode, setTheme, mode } from 'mode-watcher';
	import Button from '$lib/components/my/CsButton.svelte';
	import { onMount } from 'svelte';

	function toggleTheme() {
		toggleMode();
		if (mode.current === 'light') {
			setTheme('light');
		} else if (mode.current === 'dark') {
			setTheme('dark');
		} else {
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
			setTheme(systemTheme === 'dark' ? 'light' : 'dark');
		}
	}

	onMount(() => {
		const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
		setTheme(systemTheme);
	});
</script>

<Button onclick={toggleTheme}>
	<SunIcon
		class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
	/>
	<MoonIcon
		class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
	/>
	<span class="sr-only">Toggle theme</span>
</Button>
