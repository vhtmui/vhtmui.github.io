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

<div class="top container">
	<header class="top">
		<button class="svg home">
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
		<button class="svg theme" on:click={toggle_main_theme}>
			<Icon option={theme_icon}></Icon>
		</button>
	</header>
</div>
<main>
	<slot></slot>
</main>

<style>
	:global(:root[data-theme='Light']) {
		--header-nav-bg-color: #ffffff;
		--header-border-color: #99a4ae;
		--header-text-color: #4e4e4e;
		--header-text-hover-color: #0069c2;
		--header-block-hover-bgcolor: #8cb4ff70;
		--main-bg-color: #fdfdfd;
		--main-text-color: #1b1b1b;
		--main-a-color: #0069c2;
		--all-svg-color: var(--main-text-color);
		--scrollbar-color: #989898;
	}
	:global(:root[data-theme='Dark']) {
		--header-nav-bg-color: #181818;
		--header-border-color: #8b8e91fc;
		--header-text-color: #fdfefe;
		--header-text-hover-color: #8cb4ff;
		--header-block-hover-bgcolor: #8cb4ff70;
		--main-bg-color: #1b1b1b;
		--main-text-color: #ffffff;
		--main-a-color: #8cb4ff;
		--all-svg-color: var(--main-text-color);
		--scrollbar-color: #525049;
	}
	:global(:root) {
		--header-block-height: 3rem;
		& pre {
			overflow: auto;
			text-wrap: nowrap;
			& *{
				text-wrap: unset;
			}
		}
	}
	:global(*){
		scrollbar-color: var(--scrollbar-color) #00000000;
			text-wrap: wrap;
			word-break: break-all;
	}
	:root {
		font-family: 'CascadiaCode', 'Microsoft YaHei', Arial, sans-serif;
		line-height: 1.75;
		font-weight: normal;
		font-size: 16px;
		scroll-behavior: smooth;
		background-color: var(--main-bg-color);
		height: 100%;
		
		& *,
		:after,
		:before {
			box-sizing: border-box;
		}
		& body {
			padding: 0;
			margin: 0;
			width: 100%;
			text-rendering: optimizeSpeed;
		}
	}
	div.top.container {
		color: var(--header-text-color);
		background-color: var(--header-nav-bg-color);
		border-bottom: 0px solid var(--header-border-color);
		box-shadow: 0px 2px 5px 0px var(--header-border-color);
		position: sticky;
		top: 0;
		& header.top {
			max-width: 1440px;
			box-sizing: border-box;
			font-weight: normal;
			margin-left: auto;
			margin-right: auto;
			padding: 0 1rem 0 1rem;
			height: var(--header-block-height);
			width: 100%;
			display: flex;
			flex: 1 1;
			gap: 0.5rem;
			align-items: center;
			justify-content: flex-start;
			& nav.top {
				margin-right: auto;
				display: flex;
				overflow: auto;
				& ul {
					margin: 0;
					padding: 0;
					display: flex;
					list-style: none;
				}
				& a {
					border-radius: 0.25em;
					display: inline-block;
					box-sizing: border-box;
					padding: 0.3em 0.5em;
					text-decoration: none;
					color: inherit;
					&:hover {
						background-color: var(--header-block-hover-bgcolor);
						color: var(--header-text-hover-color);
					}
				}
			}
			& button.svg {
				box-sizing: border-box;
				margin: 0;
				padding: 0.6rem 0.4rem 0.6rem 0.4rem;
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
				& path {
					fill: var(--all-svg-color);
				}
			}
		}
	}

	main {
		margin-top: 0;
		padding: 0.5rem 2rem 0 2rem;
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
			& a {
				text-decoration: none;
				color: var(--main-text-color);
				&:hover {
					text-decoration: underline;
				}
			}
		}
		& a {
			color: var(--main-a-color);
		}
	}
</style>
