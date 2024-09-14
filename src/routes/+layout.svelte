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

<header class="top">
	<button class="btn">
		<a href="/">
			<Icon option={'home'}></Icon>
		</a>
	</button>
	<nav class="top">
		<ul>
			{#each data.summaries as { link, title }}
				<li><a href="/{link}">{title}</a></li>
			{/each}
		</ul>
	</nav>

	<button class="btn theme" on:click={toggle_main_theme}>
		<Icon option={theme_icon}></Icon>
	</button>
</header>

<main>
	<slot></slot>
</main>

<style>
	:global(:root[data-theme='Light']) {
		--header-nav-bgcolor: #ffffff;
		--header-border-color: #99a4ae;
		--header-text-color: #000000;
		--header-text-hover-color: #8cb4ff;
		--header-block-hover-bgcolor: #8cb4ff70;
		--main-bg-color: #ffffff;
		--main-text-color: #000000;
	}
	:global(:root[data-theme='Dark']) {
		--header-nav-bgcolor: #000000;
		--header-border-color: #8b8e91fc;
		--header-text-color: #fdfefe;
		--header-text-hover-color: #8cb4ff;
		--header-block-hover-bgcolor: #8cb4ff70;
		--main-bg-color: #000000;
		--main-text-color: #ffffff;
	}
	:global(:root) {
		--header-block-height: 3rem;
	}
	:root {
		font-family: 'CascadiaCode', 'Microsoft YaHei', Arial, sans-serif;
		font-size: 16px;
		height: 100%;
		& *,
		:after,
		:before {
			box-sizing: border-box;
		}
		& body {
			padding: 0;
			margin: 0;
			text-rendering: geometricPrecision;
			height: 100%;
		}
	}
	header.top {
		position: sticky;
		top: 0;
		font-weight: normal;
		box-sizing: border-box;
		display: grid;
		grid-template-columns: 2rem 1fr 3rem;
		padding-left: 2rem;
		width: 100%;
		height: var(--header-block-height);
		color: var(--header-text-color);
		background-color: var(--header-nav-bgcolor);
		border-bottom: 0px solid var(--header-border-color);
		box-shadow: 0px 2px 5px 0px var(--header-border-color);
		align-items: center;
		justify-content: center;
		& nav.top {
			display: flex;
			overflow: auto;
			& ul {
				margin: 0 auto 0 0;
				display: flex;
				list-style: none;
				& li {
					padding-right: 1em;
				}
			}
			& a {
				border-radius: 0.25em;
				display: inline-block;
				box-sizing: border-box;
				padding: 0.4em 0.7em;
				text-decoration: none;
				color: inherit;
				&:hover {
					background-color: var(--header-block-hover-bgcolor);
					color: var(--header-text-hover-color);
				}
			}
		}
		& button.theme,
		& button.btn {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
			border: none;
			outline: none;
			background-color: transparent;
			transition: transform 0.5s ease;
			transform: rotateY(0deg);
			&:hover {
				cursor: pointer;
				transform: rotateY(180deg);
			}
			&:active {
				transition: none;
				transform: rotateY(180deg) scale(1.5);
			}
		}
		& svg {
			vertical-align: middle;
		}
	}
	main {
		margin-top: 0;
		padding: 0.5rem 2rem 0 2rem;
		background-color: var(--main-bg-color);
		color: var(--main-text-color);
		& h1,
		h2,
		h3,
		h4,
		h5,
		h6 {
			&:target {
				padding-top: var(--header-block-height);
				margin-top: calc(-1 * var(--header-block-height));
			}
		}
	}
</style>
