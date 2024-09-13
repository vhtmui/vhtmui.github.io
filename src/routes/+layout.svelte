<script>
	import { clr, toggle_theme } from '$lib/css_stores.js';
	import Icon from '$lib/Icon.svelte';
	export let data;
	let theme = 'Light';
	let theme_icon = 'sun';

	function toggle_main_theme() {
		if (theme === 'Light') {
			theme = 'Dark';
			theme_icon = 'moon';
		} else {
			theme = 'Light';
			theme_icon = 'sun';
		}
		toggle_theme(theme);
	}
</script>

<nav
	style:background-color={$clr.main_nav_bg_color}
	style:color={$clr.main_text_color}
	style:border-color={$clr.main_border_color}
>
	<div><a href="/">Home</a></div>
	<ul>
		{#each data.summaries as { link, title }}
			<li><a href="/{link}">{title}</a></li>
		{/each}
	</ul>
	<button on:click={toggle_main_theme}>
		<Icon viewBox = "0 0 1024 1024" option={theme_icon}></Icon>
	</button>
	
</nav>
<main>
	<slot></slot>
</main>

<style>
	:root {
		& body {
			padding: 0;
			margin: 0;
		}
	}

	nav {
		padding-left: 1em;
		width: 100%;
		border-bottom: 1px solid;
		display: flex;
		align-items: center;
		& ul {
			display: flex;
			list-style: none;
			& li {
				padding-right: 1em;
			}
		}
	}

	button {
		border: none;
		outline: none;
		background-color: transparent;
	}

</style>
