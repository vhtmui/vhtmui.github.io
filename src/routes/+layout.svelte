<script>
	import { set_root_theme } from '$lib/css_stores.js';
	import Icon from '$lib/Icon.svelte';

	export let data;
	let theme = 'Light';
	let theme_icon = 'sun';

	function toggle_main_theme() {
		if (theme === 'Light') {
			theme_icon = 'moon';

			theme = 'Dark';
			set_root_theme(theme);
		} else {
			theme_icon = 'sun';

			theme = 'Light';
			set_root_theme(theme);
		}
	}
</script>

<nav class="top">
	<div><a href="/">
		<Icon option={"home"}></Icon>
	</a></div>
	<ul>
		{#each data.summaries as { link, title }}
			<li><a href="/{link}">{title}</a></li>
		{/each}
	</ul>
	<button class="theme" on:click={toggle_main_theme}>
		<Icon option={theme_icon}></Icon>
	</button>
</nav>
<main>
	<slot></slot>
</main>

<style>
	:global(:root[data-theme='Light']) {
		--main_nav_bg_color: #ffffff;
		--main_border_color: #2c3e50;
		--main_text_color: #2c3e50;
	}

	:global(:root[data-theme='Dark']) {
		--main_nav_bg_color: #566573;
		--main_border_color: #f2f3f4;
		--main_text_color: #fdfefe;
	}

	:root {
		font-size: 16px;
		& body {
			padding: 0;
			margin: 0;
		}
	}

	nav.top {
		box-sizing: border-box;
		color: var(--main_text_color);
		background-color: var(--main_nav_bg_color);
		padding-left: 1rem;
		width: 100%;
		height: 3rem;
		border-bottom: 1px solid var(--main_border_color);
		display: flex;
		align-items: center;
		justify-content: flex-start;
		& ul {
			margin: 0 auto 0 0;
			display: flex;
			list-style: none;
			& li {
				padding-right: 1em;
			}
		}
		& a {
			text-decoration: none;
			color: inherit;
		}
		& button.theme {
			padding-top: 0;
			padding-bottom: 0;
			border: none;
			outline: none;
			background-color: transparent;
			& :hover{
				
			}
			& svg{
				vertical-align: middle;
			}
		}
	}
</style>
