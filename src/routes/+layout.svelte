<!-- #region Script
-->
<script>
	import ZSbarContainer from '$lib/ZSibar/ZSbarContainer.svelte';
	import ZTocList from '$lib/ZTocList/ZTocList.svelte';
	import ZTopBar from '$lib/ZTopBar/ZTopBar.svelte';

	import { onMount } from 'svelte';
	import { navigating } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { rightDisplay } from '$lib/shared.svelte.js';
	import { leftDisplay } from '$lib/shared.svelte.js';
	import ZSibar from '$lib/ZSibar/ZSibar.svelte';
	import ZSidebar from '$lib/ZSibar/ZSidebar.svelte';

	let { data, children } = $props();

	/**
	 * @type {boolean} - indicate whether to hide header block
	 */
	let hideHead = $state(false);

	/**
	 * @type {string} - title levels to display in topic list
	 */
	let titles = 'h2,h3,h4,h5,h6';

	/**
	 * @type {nodeList} - nodelist passed to ZTocList.svelte
	 */
	let headings = $state();

	/**
	 * Bind to window.scrollY
	 */
	let Y = $state();

	/**
	 * @type {boolean} - Indicate whether to stop reacting to scroll event.
	 */
	let stopReactScroll = $state(false);

	/**
	 * @type {number} - bind to the `window.innerWidth`
	 */
	let windowWidth = $state(0);

	/**
	 * @type {number} - bind to the `window.scrollY`
	 */
	let timer;

	/**
	 * @type {element} - bind to the `sidebar` element
	 */
	let moblieSidebar = $state();

	/**
	 * @type {object} - Snapshot of `rightDisplay`.
	 */
	let { displayToc } = $state(rightDisplay);

	// Scroll header while scrolling.
	let top = $state(0);
	let lastY = $state();
	function scrollHeader() {
		if (stopReactScroll) return;
		let gap = Y - lastY;
		if (top - gap < 0 && top - gap > -96) {
			top = top - gap;
		} else if (top - gap >= 0) top = 0;
		else if (top - gap <= -96) top = -96;
		lastY = Y;
	}

	onMount(() => {
		lastY = Y;

		// Show right sidebar if not in home page.
		$page.url.pathname !== '/'
			? (rightDisplay.displayToc = true)
			: (rightDisplay.displayToc = false);

		// Hide left sidebar if in home page. Always hide mobile sidebar on start.
		leftDisplay.displayMobile = false;
		$page.url.pathname === '/' ? (leftDisplay.displayPC = false) : (leftDisplay.displayPC = true);
	});

	afterNavigate(() => {
		// get head elements passed to <ZTocList>.
		headings = document.querySelectorAll(titles);

		// Reset sidebars when navigating between home and other pages.
		if ($navigating && windowWidth >= 768) {
			const { from, to } = $navigating;
			if (from.url.pathname !== '/' && to.url.pathname === '/') {
				leftDisplay.displayPC = false;

				// Save the current value of `displayToc` and set it to false.
				displayToc = rightDisplay.displayToc;
				rightDisplay.displayToc = false;
			} else if (from.url.pathname === '/' && to.url.pathname !== '/') {
				leftDisplay.displayPC = true;

				rightDisplay.displayToc = displayToc;
			}
		}
	});

	$effect(() => {
		if (moblieSidebar) {
			removeEventListener('click', clickOutside);
			function clickOutside(e) {
				if (e.clientY > moblieSidebar?.getBoundingClientRect().bottom) {
					leftDisplay.displayMobile = false;
					removeEventListener('click', clickOutside);
				}
			}
			addEventListener('click', clickOutside);
		}
	});
</script>

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
	<title>{'VH ' + $page.url.pathname.substring(1).replaceAll('/', ' · ')}</title>
</svelte:head>

<!-- #region Content
-->
<svelte:window bind:innerWidth={windowWidth} bind:scrollY={Y} onscroll={() => scrollHeader()} />
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div
	id="headHolder"
	onmouseenter={() => {
		stopReactScroll = true;
		top = 1;
	}}
></div>
<div class="topContainer" class:hideHead style="top: {top}px;">
	<div class="topInnerContainer">
		<ZTopBar></ZTopBar>
	</div>
</div>
<main
	onmouseenter={() => {
		stopReactScroll = false;
		timer = setTimeout(() => (top = -96), 1000);
	}}
	onmouseleave={() => clearTimeout(timer)}
>
	<ZSibar Dirs={data.directory} bind:ZSibar={moblieSidebar}></ZSibar>
	<div class="content">
		{@render children?.()}
	</div>
	{#if rightDisplay.displayToc}
		<div class="toc">
			{#if headings && headings?.length}
				<div class="tocContainer" transition:slide|global={{ duration: 300, axis: 'x' }}>
					<ZTocList {headings} indent="1" />
				</div>
			{/if}
		</div>
	{/if}
</main>

<!-- #region Style
-->
<style>
	:global {
		* {
			/* scrollbar-color: var(--scrollbar-color) #00000000; */
			text-wrap: wrap;
			scroll-behavior: smooth;
		}
		::-webkit-scrollbar,
		::-webkit-scrollbar-track {
			background-color: #00000000;
			width: 8px;
			height: 8px;
		}
		::-webkit-scrollbar-thumb {
			background-color: var(--scrollbar-color);
			border-radius: 4px;
		}
		:root {
			word-break: break-word;
			font-family: 'Segoe UI', 'Microsoft YaHei', Arial, sans-serif;
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
				max-width: 100%;
				text-rendering: optimizeSpeed;
			}
		}
		#headHolder {
			position: fixed;
			top: 3px;
			width: 100%;
			height: calc(var(--header-block-height) - 4px);
			z-index: 15;
		}
		div.topContainer {
			color: var(--header-text-color);
			background-color: var(--header-nav-bg-color);
			position: sticky;
			top: 1px;
			z-index: 20;
			transition: top 100ms linear;
			max-width: 100%;
			height: auto;
			/* pointer-events: none; */
			&.hideHead {
				top: calc(0rem - var(--header-block-height));
				transition: top 100ms linear;
			}
			& div.topInnerContainer {
				max-width: var(--main-max-width);
				min-width: fit-content;
				padding: 0 1rem 0 0;
				margin-left: auto;
				margin-right: auto;
				display: flex;
				align-items: center;
				height: var(--header-block-height);
			}
		}
		main {
			position: relative;
			top: 0;
			z-index: 10;
			box-sizing: content-box !important;
			margin-top: 0;
			min-height: 100vh;
			color: var(--main-text-color);
			display: flex;
			flex-wrap: nowrap;
			padding: 0.5rem 1rem 0 2rem;
			margin: auto;
			max-width: var(--main-max-width);
			& div.content {
				max-width: 100%;
				overflow-wrap: break-word;
				line-height: 1.75;
				& a {
					color: var(--main-a-color);
					&:visited {
						/* color: var(--main-visited-a-color); */
					}
				}
			}
			& div.sidebar-container {
				display: none;
				padding: 0;
			}
			& div.mobilesidebar-container {
				display: block;
				position: fixed;
				z-index: 11;
				& .sibar-innercontainer {
					background-color: var(--header-btn-bg-color);
					backdrop-filter: blur(10px);
					position: fixed;
					border-radius: 1rem;
					left: 0;
					width: 100%;
				}
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
				display: flex;
				flex-wrap: nowrap;
				padding: 0.5rem 2rem 0 2rem;
				margin: auto;
				& div.sidebar-container {
					width: 25%;
					display: block;
					& .sibar-innercontainer {
						position: fixed;
						top: calc(var(--header-block-height) + 2rem);
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
					width: 75%;
					padding: 0 3rem 0 3rem;
				}
				& main div.toc {
					display: none;
				}
			}
		}
		@media (min-width: 1200px) {
			main {
				display: flex;
				padding: 0.5rem 2rem 0 4rem;
				margin: auto;
				& div.sidebar-container {
					width: 20%;
					display: block;
					& .sibar-innercontainer {
						position: fixed;
						top: calc(var(--header-block-height) + 2rem);
						background-color: transparent;
						backdrop-filter: none;
						min-width: initial;
					}
				}
				& div.mobilesidebar-container {
					display: none;
				}
				& div.content {
					flex: 1;
					width: 60%;
					padding: 0 3rem 0 3rem;
				}
				& div.toc {
					display: block;
					max-width: 20%;
					min-width: 0;
					.tocContainer {
						margin-top: 5rem;
						position: sticky;
						top: calc(var(--header-block-height) + 5rem);
						padding: 0 4rem 0 0;
					}
				}
			}
		}
	}
</style>
