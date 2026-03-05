<script lang="ts">
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	import { toggleMode, setTheme, theme } from 'mode-watcher';
	import { Button } from '@ui/button';

	function toggleTheme() {
		toggleMode();
		if (theme.current === 'light') {
			setTheme('dark');
		} else if (theme.current === 'dark') {
			setTheme('light');
		} else {
			// If the theme is 'system', toggle to the opposite of the current system theme
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
			setTheme(systemTheme === 'dark' ? 'light' : 'dark');
		}
	}
</script>

<Button onclick={toggleTheme} variant="ghost" size="icon">
	<SunIcon
		class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
	/>
	<MoonIcon
		class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
	/>
	<span class="sr-only">Toggle theme</span>
</Button>
