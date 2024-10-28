<!-- @migration-task Error while migrating Svelte code: Can't migrate code with afterUpdate. Please migrate by hand. -->
<script>
	import BlurBtn from '$lib/BlurBtn/BlurBtn.svelte';
	import Icon from '$lib/Icon/Icon.svelte';
	import SbarContainer from '$lib/Sibar/SbarContainer.svelte';
	import TocList from '$lib/TocList/TocList.svelte';
	import { root } from './tree';
	import { get_childArray } from '$lib/Sibar/nav';
	import ThemeBtn from '$lib/ThemeBtn/ThemeBtn.svelte';

	import { onMount } from 'svelte';
	import { quadOut } from 'svelte/easing';
	import { navigating } from '$app/stores';
	import { slide } from 'svelte/transition';
	import Page from './+page.svelte';

	let { children } = $props();
	let headings = $state();
	let menuIcon = $state('menu_fold');
	let display = $state(true);
	let BlurBtnSytle = $state();
	let hiddeHead = $state(false);

	let tocBlock;
	let titles = 'h2,h4';
	let tocDisplay = $state();

	function flexSlide(node, { delay = 0, duration = 400 }) {
		return {
			delay,
			duration,
			easing: quadOut,
			css(t, u) {
				const flex = window.getComputedStyle(node).flexGrow;
				const padding_r = window.getComputedStyle(node).paddingRight.slice(0, -2);

				return `
            overflow: hidden;
            min-width: 0;
            flex: ${Math.round(t * 100 * flex) / 100} 1 0px;
			padding-right: ${padding_r * t}px;
        `;
			}
		};
	}

	let lastScrollY;
	let timeoutId = null;
	function hiddeHeader() {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			const offset = window.scrollY - lastScrollY;
			if (offset > 0) {
				hiddeHead = true;
			} else if (offset < 0) {
				hiddeHead = false;
			}
			lastScrollY = window.scrollY;
		}, 100);
	}

	onMount(() => {
		const mediaQuery = window.matchMedia('(max-width: 767px)');
		mediaQuery.addListener(function (mql) {
			console.log('match!');
			if (mql.matches) {
				display = false;
			} else {
				display = true;
			}
		});
		if (mediaQuery.matches) {
			display = false;
			BlurBtnSytle = 'transform: rotateY(180deg); transition: transform 300ms ease-out 70ms;';
		}

		/**
		 * hide topbar while scroll down, and display it while scroll up.
		 */
		lastScrollY = window.scrollY;
		addEventListener('scroll', hiddeHeader);

		/**
		 * doing things while resizing
		 *
		 * destroy toclist component while the container display none
		 */
		let timeoutId2 = null;
		tocDisplay = window.getComputedStyle(tocBlock).display;
		addEventListener('resize', () => {
			timeoutId2 && clearTimeout(timeoutId2);
			timeoutId2 = setTimeout(() => {
				tocDisplay = window.getComputedStyle(tocBlock).display;
			}, 100);
		});
	});
	$effect(() => {
		// trigger effect while navigating
		$navigating;

		/**
		 * destroy toclist component while the container display none
		 */
		if (tocDisplay !== 'none') {
			headings = document.querySelectorAll(titles);
		} else {
			headings = null;
		}
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

<div class="topContainer" class:hiddeHead>
	<div class="topInnerContainer">
		<div class="topLeftHeader">
			<BlurBtn
				class="sibarBtn"
				style={BlurBtnSytle}
				onclick={() => {
					display
						? (BlurBtnSytle =
								'transform: rotateY(180deg); transition: transform 300ms ease-out 70ms;')
						: (BlurBtnSytle =
								'transform: rotateY(0deg); transition: transform 300ms ease-out 70ms;');
					display = !display;
				}}
			>
				<Icon option={menuIcon} />
			</BlurBtn>
			<BlurBtn style="margin-left: 3rem">
				<a href="/">
					<Icon option={'home'} />
				</a>
			</BlurBtn>
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
	{#if display}
		<div
			class="sidebar-container"
			onoutroend={() => {
				/**
				 * prevent scrolled event while animation displaying.
				 */
				addEventListener('scroll', hiddeHeader);
			}}
			onintroend={() => {
				addEventListener('scroll', hiddeHeader);
			}}
			onoutrostart={() => {
				removeEventListener('scroll', hiddeHeader);
			}}
			onintrostart={() => {
				removeEventListener('scroll', hiddeHeader);
			}}
			transition:flexSlide|global={{ duration: 300, delay: 70 }}
		>
			<div class="sibar-innercontainer">
				<SbarContainer signal="expandAll" />
			</div>
		</div>
	{/if}
	<div class="content">
		{@render children?.()}
	</div>
	<div class="toc" bind:this={tocBlock}>
		{#if headings && headings?.length}
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
			--main-bg-color: rgb(255, 255, 255);
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
		* {
			scrollbar-color: var(--scrollbar-color) #00000000;
			text-wrap: wrap;
			scroll-behavior: smooth;
		}
		:root {
			word-break: break-word;
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
			transition: top 100ms linear;
			pointer-events: none;
			&.hiddeHead {
				top: calc(0rem - var(--header-block-height));
				transition: top 100ms linear;
			}
			& div.topInnerContainer {
				max-width: 1660px;
				padding: 0 1rem 0 0;
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
					& .sibarBtn {
						position: fixed;
					}
				}
			}
		}
		main {
			margin-top: 0;
			min-height: 100vh;
			color: var(--main-text-color);
			display: flex;
			flex-wrap: nowrap;
			padding: 0.5rem 1rem 0 2rem;
			margin: auto;
			max-width: 100%;
			& div.content {
				max-width: 100%;
				overflow-wrap: break-word;
				& a {
					color: var(--main-a-color);
					&:visited {
						color: var(--main-visited-a-color);
					}
				}
			}
			& div.sidebar-container {
				padding-right: 0;
				display: block;
				width: 0;
				& .sibar-innercontainer {
					background-color: var(--header-btn-bg-color);
					backdrop-filter: blur(10px);
					position: fixed;
					border-radius: 1rem;
					min-width: 85%;
				}
			}
			& div.toc {
				padding-left: 3%;
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
				display: flex;
				flex-wrap: nowrap;
				padding: 0.5rem 2rem 0 4rem;
				margin: auto;
				max-width: var(--main-max-width);
				& div.sidebar-container {
					padding-right: 1%;
					flex: 1;
					display: block;
					& .sibar-innercontainer {
						width: calc((100% - 6rem) * 0.25 - 1%);
						position: fixed;
						top: var(--header-block-height);
						background-color: transparent;
						backdrop-filter: none;
						min-width: initial;
					}
				}
				& div.content {
					flex: 3;
				}
				& main div.toc {
					display: none;
				}
			}
		}
		@media (min-width: 1200px) {
			main {
				display: flex;
				flex-wrap: nowrap;
				padding: 0.5rem 2rem 0 4rem;
				margin: auto;
				max-width: var(--main-max-width);
				& div.sidebar-container {
					padding-right: 1%;
					flex: 1;
					display: block;
					& .sibar-innercontainer {
						width: calc((100% - 6rem) * 0.2 - 1%);
						position: fixed;
						top: var(--header-block-height);
						background-color: transparent;
						backdrop-filter: none;
						min-width: initial;
					}
				}
				& div.content {
					flex: 3;
				}
				& div.toc {
					flex: 1;
					display: block;
				}
			}
		}
	}
</style>
