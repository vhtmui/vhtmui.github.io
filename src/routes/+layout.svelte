<script>
	import { slide } from 'svelte/transition';
	import { quadOut } from 'svelte/easing';
	import Icon from '$lib/Icon/Icon.svelte';
	import SbarContainer from '$lib/Sibar/SbarContainer.svelte';
	import TocList from '$lib/TocList.svelte';
	import { onMount, afterUpdate } from 'svelte';
	import { root } from './tree';
	import { get_childArray } from '$lib/Sibar/nav';
	import { url } from '$lib/Sibar/stores';
	import ThemeBtn from '$lib/ThemeBtn/ThemeBtn.svelte';
	import BlurBtn from '$lib/BlurBtn.svelte';

	let titles = 'h2,h4';
	let headings;
	let menuIcon = 'menu_fold';
	let undisplay = true;
	// let tree = root;
	function flexSlide(node, { delay = 0, duration = 400 }) {
		return {
			delay,
			duration,
			easing: quadOut,
			css(t, u) {
				const grow = window.getComputedStyle(node).flexGrow;

				return `
            overflow: hidden;
            min-width: 0;
            flex: ${Math.round(t * 100 * grow) / 100} 1 0px;
        `;
			}
		};
	}
	onMount(() => {});
	afterUpdate(() => {
		url.set(window.location.pathname);
		headings = document.querySelectorAll(titles);
	});
</script>

<svelte:head>
	<script>
		/**
		 * Set theme on start
		 */
		document.addEventListener('DOMContentLoaded', () => {
			const localTheme = localStorage.getItem('theme');
			if (localTheme === 'Dark' || localTheme === 'Light') {
				document.documentElement.setAttribute('data-theme', localTheme);
			} else {
				if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
					document.documentElement.setAttribute('data-theme', 'Dark');
				} else {
					document.documentElement.setAttribute('data-theme', 'Light');
				}
			}
		});
	</script>
</svelte:head>
<div class="topContainer">
	<div class="topInnerContainer">
		<div class="topLeftHeader">
			<BlurBtn on:click={() => (undisplay = !undisplay)}>
				<Icon option={menuIcon} />
			</BlurBtn>
			<button class="svg home" type="button">
				<a href="/">
					<Icon option={'home'} />
				</a>
			</button>
		</div>
		<header class="top">
			<nav class="top">
				<ul></ul>
			</nav>
			<div class="toggleThme">
				<ThemeBtn />
			</div>
		</header>
	</div>
</div>
<main>
	{#if undisplay}
		<div class="sidebar-container" transition:flexSlide|global={{ duration: 400 }}>
			<SbarContainer signal="expandAll" />
			<!-- <div>hhhh</div> -->
		</div>
	{/if}
	<div class="content">
		<slot />
	</div>
	<div class="toc" transition:slide|global={{ axis: 'x' }}>
		{#if headings && headings.length}
			<TocList {headings} indent="0.5" />
		{/if}
	</div>
</main>

<style>
	:global {
		:root[data-theme='Light'] {
			--header-nav-bg-color: rgba(255, 255, 255, 0);
			--header-border-color: #888888;
			--header-text-color: #4e4e4e;
			--header-text-hover-color: #0069c2;
			--header-text-active-color: #0057a3;
			--header-block-hover-bg-color: #8cb4ff70;
			--header-btn-bg-color: rgb(255, 255, 255, 50%);
			--header-btn-theme-bg-color: #ffc684;
			--main-bg-color: #ffffff;
			--main-text-color: #1b1b1b;
			--main-a-color: #0069c2;
			--main-visited-a-color: var(--main-a-color);
			--all-svg-color: var(--header-text-color);
			--all-svg-hover-color: var(--header-text-hover-color);
			--sidebar-svg-color: #454545ba;
			--sidebar-border-top-color: #6f6f6f;
			--sidebar-border-left-color: #00000054;
			--sidebar-border-color: #999999;
			--sidebar-selected-text-color: #0048c6;
			--sidebar-selected-border-color: #3c95e9b5;
			--sidebar-selected-border-style: groove;
			--sidebar-filter-text-bg-bolor: #5d00ff;
			--sidebar-filter-text-bolor: #ffffff;
			--tocItem-text-color: #515151bf;
			--input-focus-color: #659aff;
			--scrollbar-color: #989898;
		}
		:root[data-theme='Dark'] {
			--header-nav-bg-color: rgba(255, 255, 255, 0);
			--header-border-color: #8b8e91fc;
			--header-text-color: #fdfefe;
			--header-text-hover-color: #ffa06f;
			--header-text-active-color: #ffa06f;
			--header-block-hover-bg-color: #ff73732e;
			--header-btn-bg-color: rgb(27, 27, 27, 50%);
			--header-btn-theme-bg-color: #ffc684;
			--main-bg-color: #1b1b1b;
			--main-text-color: #ffffff;
			--main-a-color: #ff8c8c;
			--main-visited-a-color: var(--main-a-color);
			--all-svg-color: var(--main-text-color);
			--all-svg-hover-color: var(--header-text-color);
			--sidebar-svg-color: #ffffff80;
			--sidebar-border-top-color: #e6e6e6d2;
			--sidebar-border-left-color: #ffffff54;
			--sidebar-border-color: #999999;
			--sidebar-selected-text-color: #ff5a5a;
			--sidebar-selected-border-color: brown;
			--sidebar-selected-border-style: ridge;
			--sidebar-filter-text-bg-bolor: #e8e87e;
			--sidebar-filter-text-bolor: #000000;
			--tocItem-text-color: #ffffffba;
			--input-focus-color: #b42100;
			--scrollbar-color: #525049;
		}
		:root {
			--header-block-height: 3rem;
			--sibar-block-height: 2.5rem;
			--all-svg-width: 1.25rem;
			--main-max-width: 1660px;
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
			scroll-behavior: smooth;
		}
		:root {
			word-break: break-all;
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
		div.topContainer {
			color: var(--header-text-color);
			background-color: var(--header-nav-bg-color);
			position: sticky;
			top: 0;
			pointer-events: none;
			& div.topInnerContainer {
				max-width: 1600px;
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
					& * {
						pointer-events: auto;
					}
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
							&.active {
								background-color: var(--header-block-hover-bg-color);
								color: var(--header-text-hover-color);
							}
						}
					}
				}
				& .topLeftHeader {
					display: flex;
					align-items: center;
					& * {
						pointer-events: auto;
					}
					& button.svg {
						box-sizing: border-box;
						margin: 0;
						padding: 0;
						height: var(--header-block-height);
						width: 3rem;
						border: none;
						border-radius: 0.7rem;
						outline: none;
						background-color: transparent;
						&:hover {
							cursor: pointer;
							& path {
								fill: var(--header-text-hover-color);
								stroke: var(--header-text-hover-color);
							}
						}
						&:active {
							& path {
								fill: var(--header-text-active-color);
								stroke: var(--header-text-hover-color);
							}
						}
						& a {
							display: flex;
							width: 100%;
							height: 100%;
							align-items: center;
							justify-content: center;
						}
					}
				}
				& svg {
					vertical-align: middle;
					& * {
						fill: var(--all-svg-color);
						stroke: var(--all-svg-color);
					}
				}
			}
		}

		main {
			margin-top: 0;
			min-height: 100vh;
			color: var(--main-text-color);
			& div.content {
				padding: 0 3rem;
				& a {
					color: var(--main-a-color);
					&:visited {
						color: var(--main-visited-a-color);
					}
				}
			}
			& div.sidebar-container {
				display: none;
				width: 100%;
			}
			& div.toc {
				display: none;
			}
			& h1,
			& h2,
			& h3,
			& h4,
			& h5,
			& h6 {
				margin: 2rem 0 1rem 0;
				&:target {
					scroll-margin-top: var(--header-block-height);
				}
				& a {
					text-decoration: none;
					color: var(--main-text-color);
					&:hover {
						text-decoration: underline;
					}
				}
			}
		}

		@media (min-width: 768px) and (max-width: 1199px) {
			main {
				display: grid;
				grid-template-areas: 'Lsidebar content';
				gap: 2rem;
				grid-template-columns: minmax(0, 1fr) minmax(0, 2.5fr);
				padding: 0.5rem 2rem 0 2rem;
			}
			main div.sidebar-container {
				display: block;
			}
			main div.toc {
				display: none;
			}
		}
		@media (min-width: 1200px) {
			main {
				display: flex;
				flex-wrap: nowrap;
				padding: 0.5rem 2rem 0 2rem;
				margin: auto;
				max-width: var(--main-max-width);
			}
			main div.sidebar-container {
				flex: 1;
				display: block;
			}
			main div.content {
				flex: 3;
			}
			main div.toc {
				flex: 1;
				display: block;
			}
		}
		/* @media (min-width: 1200px) {
		main {
			display: grid;
			grid-template-areas: 'Lsidebar content Rsidebar';
			gap: 2rem;
			grid-template-columns: minmax(0,1fr) minmax(0, 2.5fr) minmax(8rem,0.8fr);
			padding: 0.5rem 2rem 0 2rem;
			margin: auto;
			max-width: 1660px;
		}
		main div.sidebar-container {
			display: block;
			width: 100%;
		}
		main div.toc {
			display: block;
		}
	} */
	}
</style>
