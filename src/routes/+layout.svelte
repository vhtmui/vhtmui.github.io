<script>
	// @ts-nocheck

	import Icon from '$lib/Icon.svelte';
	import Sidebar from '$lib/Sidebar.svelte';
	import Links from '$lib/Links.svelte';
	import { onMount, tick } from 'svelte';

	export let data;

	let theme;
	let theme_icon;

	/**
	 * Set the theme by set the attribute of <html> element
	 * @param {string} string  - 'Light|Dark'
	 */
	function set_root_theme(string) {
		document.documentElement.setAttribute('data-theme', string);
	}
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

	onMount(() => {
		theme = document.documentElement.getAttribute('data-theme');
		theme === 'Dark' ? theme_icon = 'moon' : theme_icon = 'sun';
	});

</script>

<div class="top container">
	<button class="svg home">
		<a href="/">
			<Icon option={'home'}></Icon>
		</a>
	</button>
	<header class="top">
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
	<div class="sidebar right">
		<Sidebar />
	</div>
	<div class="content">
		<slot></slot>
	</div>
</main>

<style>
	/* Use :global to set attr of some element,class that dosn't apear in this file */
	:global(:root[data-theme='Light']) {
		--header-nav-bg-color: #ffffff;
		--header-border-color: #99a4ae;
		--header-text-color: #4e4e4e;
		--header-text-hover-color: #0069c2;
		--header-block-hover-bg-color: #8cb4ff70;
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
		--header-block-hover-bg-color: #8cb4ff70;
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
			& * {
				text-wrap: unset;
			}
		}
	}
	:global(*) {
		scrollbar-color: var(--scrollbar-color) #00000000;
		text-wrap: wrap;
		word-break: break-all;
		scroll-behavior: smooth;
	}
	:root {
		font-family: 'CascadiaCode', 'Microsoft YaHei', Arial, sans-serif;
		line-height: 1.75;
		font-weight: normal;
		font-size: 16px;
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
		padding-left: 1rem;
		display: flex;
		position: sticky;
		top: 0;
		height: var(--header-block-height);
		& header.top {
			max-width: 1440px;
			box-sizing: border-box;
			font-weight: normal;
			margin-left: 0;
			margin-right: auto;
			padding: 0 1rem 0 1rem;
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
						background-color: var(--header-block-hover-bg-color);
						color: var(--header-text-hover-color);
					}
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

	main {
		display: grid;
		grid-template-areas: 'Lsidebar content Rsidebar';
		gap: 3rem;
		grid-template-columns: minmax(0, 1fr) minmax(0, 2.5fr) minmax(0, 15rem);
		margin-top: 0;
		padding: 0.5rem 1rem 0 1rem;
		color: var(--main-text-color);
		& .sidebar.right {
			position: sticky;
			top: var(--header-block-height);
			min-width: 7rem;
		}
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
