<script>
	// @ts-nocheck

	import Icon from '$lib/Icon.svelte';
	import SbarContainer from '$lib/SbarContainer.svelte';
	import { onMount, afterUpdate } from 'svelte';
	import { root, get_childArray } from './nav';
	import { url } from '$lib/stores';

	let theme;
	let theme_icon;
	let tree = root.tools;

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

	$: links = get_childArray(root);

	onMount(() => {
		theme = document.documentElement.getAttribute('data-theme');
		theme === 'Dark' ? (theme_icon = 'moon') : (theme_icon = 'sun');
	});
	afterUpdate(() => {
		url.set(window.location.pathname);
		// console.log({$url});
	});	
</script>

<div class="top container">
	<div class="top inner-container">
		<button class="svg home">
			<a href="/">
				<Icon option={'home'} />
			</a>
		</button>
		<header class="top">
			<nav class="top">
				<ul>
					{#each links as link}
						<li><a href="/{link._link}">{link._title}</a></li>
					{/each}
				</ul>
			</nav>
			<button class="svg theme" on:click={toggle_main_theme}>
				<Icon option={theme_icon} />
			</button>
		</header>
	</div>
</div>
<main>
	<div class="sidebar-container">
		<div class="sidebar right">
			<SbarContainer {tree} />
		</div>
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
		--sidebar-svg-color: #454545ba;
		--sidebar-border-top-color: #00000000;
		--sidebar-border-left-color: #00000054;
		/* --sidebar-selected-color:; */
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
		--sidebar-svg-color: #ffffff80;
		--sidebar-border-top-color: #e6e6e6d2;
		--sidebar-border-left-color: #ffffff54;
		--scrollbar-color: #525049;
	}
	:global(:root) {
		--header-block-height: 3rem;
		--all-svg-width: 1.25rem;
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
		font-family: 'Intel', 'Microsoft YaHei', Arial, sans-serif;
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
		position: sticky;
		top: 0;
		& div.top.inner-container {
			max-width: 1440px;
			margin-left: auto;
			margin-right: auto;
			display: flex;
			align-items: center;
			height: var(--header-block-height);
			& header.top {
				box-sizing: border-box;
				font-weight: normal;
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
				padding: 0 1rem 0 1rem;
				height: var(--header-block-height);
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
		color: var(--main-text-color);
		& div.content {
			padding: 0 1rem;
		}
		& div.sidebar.right {
			margin-right: auto;
			margin-left: auto;
			width: 100%;
			padding-top: 1rem;
			position: sticky;
			top: var(--header-block-height);
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

	@media (min-width: 720px) {
		main {
			display: grid;
			grid-template-areas: 'Lsidebar content';
			gap: 2rem;
			grid-template-columns: minmax(12rem, 0.8fr) minmax(0, 2.5fr);
			padding: 0.5rem 2rem 0 2rem;
		}
	}
	@media (min-width: 1100px) {
		main {
			display: grid;
			grid-template-areas: 'Lsidebar content Rsidebar';
			gap: 2rem;
			grid-template-columns: minmax(0, 0.8fr) minmax(0, 2.5fr) minmax(10rem, 15rem);
			padding: 0.5rem 2rem 0 2rem;
		}
	}
</style>
