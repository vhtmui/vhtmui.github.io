<!-- #region Script
-->
<script>
	import ZBlurBtn from '$lib/ZBlurBtn/ZBlurBtn.svelte';
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';
	import ZSbarContainer from '$lib/ZSibar/ZSbarContainer.svelte';
	import ZTocList from '$lib/ZTocList/ZTocList.svelte';
	import ZThemeBtn from '$lib/ZThemeBtn/ZThemeBtn.svelte';

	import { root } from './tree';
	import { get_childArray } from '$lib/ZSibar/Znav';

	import { onMount } from 'svelte';
	import { quadOut } from 'svelte/easing';
	import { navigating } from '$app/stores';
	import { slide } from 'svelte/transition';

	let { data, children } = $props();

	/**
	 * @type {string} - icon of sidebar menu
	 */
	let menuIcon = $state('menu_fold');

	/**
	 * @type {boolean} - indicate sidebar's display behavior
	 */
	let display = $state(true);

	/**
	 * @type {string} - css string of sidebar menu
	 */
	let BlurBtnSytle = $state();

	/**
	 * @type {boolean} - indicate whether to hide header block
	 */
	let hideHead = $state(false);

	/**
	 * @type {HTMLDivElement} - bind to topic list element
	 */
	let tocBlock = $state();

	/**
	 * @type {string} - title levels to display in topic list
	 */
	let titles = 'h2,h4';

	/**
	 * @type {nodeList} - nodelist passed to ZTocList.svelte
	 */
	let headings = $state();

	/**
	 * @type {string} - the `display` attribute of topic list element's style
	 */
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
	function hideHeader() {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			const offset = window.scrollY - lastScrollY;
			if (offset > 0) {
				hideHead = true;
			} else if (offset < 0) {
				hideHead = false;
			}
			lastScrollY = window.scrollY;
		}, 100);
	}

	onMount(() => {
		/**
		 * hide topbar while scroll down, and display it while scroll up.
		 */
		lastScrollY = window.scrollY;
		addEventListener('scroll', hideHeader, { passive: true });

		/**
		 * doing things while resizing
		 */
		let timeoutId2 = null;
		tocDisplay = window.getComputedStyle(tocBlock).display;
		addEventListener('resize', () => {
			timeoutId2 && clearTimeout(timeoutId2);
			timeoutId2 = setTimeout(() => {
				// destroy toclist component while its container display none
				tocDisplay = window.getComputedStyle(tocBlock).display;
			}, 100);
		});
	});
	$effect(() => {
		// trigger effect while navigating
		$navigating;

		// destroy toclist component while its container display none
		if (tocDisplay !== 'none') {
			headings = document.querySelectorAll(titles);
		} else {
			headings = null;
		}
	});
</script>

<!-- #endregion -->

<!-- #region Set head 
 -->
<svelte:head>
	<script>
		/**
		 * Set theme on start, no need to wait domcontentload
		 */
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
	</script>
	<link href="/global.css" rel="stylesheet" />
</svelte:head>
<!-- #endregion -->

<!-- #region Content
-->
<div class="topContainer" class:hideHead>
	<div class="topInnerContainer">
		<div class="topLeftHeader">
			<ZBlurBtn
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
				<ZIcon option={menuIcon} />
			</ZBlurBtn>
			<ZBlurBtn style="margin-left: 3rem">
				<a href="/">
					<ZIcon option={'home'} />
				</a>
			</ZBlurBtn>
		</div>
		<header class="top">
			<nav class="top">
				<ul></ul>
			</nav>
			<div class="toggleThme">
				<ZThemeBtn />
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
				addEventListener('scroll', hideHeader);
			}}
			onintroend={() => {
				addEventListener('scroll', hideHeader);
			}}
			onoutrostart={() => {
				removeEventListener('scroll', hideHeader);
			}}
			onintrostart={() => {
				removeEventListener('scroll', hideHeader);
			}}
			transition:flexSlide|global={{ duration: 300, delay: 70 }}
		>
			<div class="sibar-innercontainer">
				<ZSbarContainer signal="expandAll" />
			</div>
		</div>
	{/if}
	{#if !display}
		<div class="mobilesidebar-container">
			<div class="sibar-innercontainer">
				<ZSbarContainer signal="expandAll" />
			</div>
		</div>
	{/if}
	<div class="content">
		{@render children?.()}
	</div>
	<div class="toc" bind:this={tocBlock}>
		{#if headings && headings?.length}
			<ZTocList {headings} indent="0.5" />
		{/if}
	</div>
</main>
<!-- #endregion -->

<!-- #region Style
-->
<style>
	:global {
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
			& pre {
				overflow: auto;
				text-wrap: nowrap;
				& * {
					text-wrap: unset;
				}
			}
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
			&.hideHead {
				top: calc(0rem - var(--header-block-height));
				transition: top 100ms linear;
			}
			& div.topInnerContainer {
				max-width: var(--main-max-width);
				padding: 0 1rem 0 0;
				margin-left: auto;
				margin-right: auto;
				display: flex;
				align-items: center;
				height: var(--header-block-height);
				& header.top {
					box-sizing: border-box;
					font-weight: normal;
					padding: 0 2vw 0 1rem;
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
				display: none;
			}
			& div.mobilesidebar-container {
				display: block;
				position: fixed;
				& .sibar-innercontainer {
					background-color: var(--header-btn-bg-color);
					backdrop-filter: blur(10px);
					position: fixed;
					border-radius: 1rem;
					left: 0;
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
				padding: 0.5rem 2rem 0 2rem;
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
				& div.mobilesidebar-container {
					display: none;
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
						width: calc((min(var(--main-max-width), 100%) - 6rem) * 0.96 * 0.2);
						position: fixed;
						top: var(--header-block-height);
						background-color: transparent;
						backdrop-filter: none;
						min-width: initial;
					}
				}
				& div.mobilesidebar-container {
					display: none;
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
<!-- #endregion -->