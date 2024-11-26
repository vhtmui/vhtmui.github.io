<!-- #region Script
-->
<script>
	import ZBlurBtn from '$lib/ZBlurBtn/ZBlurBtn.svelte';
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';
	import ZSbarContainer from '$lib/ZSibar/ZSbarContainer.svelte';
	import ZTocList from '$lib/ZTocList/ZTocList.svelte';
	import ZThemeBtn from '$lib/ZThemeBtn/ZThemeBtn.svelte';
	import ZHeader from '$lib/ZHeader/ZHeader.svelte';
	import ZNav from '$lib/ZNav/ZNav.svelte';
	import { get_childArray } from '$lib/ZSibar/Znav';

	import { onMount } from 'svelte';
	import { quadOut } from 'svelte/easing';
	import { navigating } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { afterNavigate } from '$app/navigation';
	import { spring, tweened } from 'svelte/motion';
	import { page } from '$app/stores';
	import { displays } from '$lib/shared.svelte.js';

	let { data, children } = $props();

	/**
	 * @type {string} - icon of sidebar menu
	 */
	let menuIcon = $state('menu_fold');

	/**
	 * @type {boolean} - Indicate right sidebar's display.
	 */
	let displaysdisplayToc = $state(true);

	/**
	 * @type {string} - css string of sidebar menu
	 */
	let BlurBtnSytle = $state();

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
	 * @type {number} - bind to the `clientWidth` of `div.sidebar-container`
	 */
	let SibarWidth = $state();

	/**
	 * @type {HTMLDivElement} - bind to the `div.mobilesidebar-container`
	 */
	let mobileSibar = $state();

	let mobileSibarWidth = $state();

	/**
	 * Bind to window.scrollY
	 */
	let Y = $state();

	let stopReactScroll = $state(false);

	let windowWidth = $state(0);

	/**
	 * on mobile terminal, undisplay the sidebar while click outside
	 * @param {Event} event - event
	 */
	function clickOutsideMobileSibarHandler(event) {
		if (!mobileSibar?.contains(event.target)) {
			displays.display = true;
		}
	}

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

	let { display, displayToc } = displays;
	$effect(() => {
		$navigating ? console.log($navigating) : '';
		console.log(displays);
		if ($navigating.to.url.pathname === '/') {
			display = displays.display;
			display = displays.displayToc;
			displays.display = displays.displayToc = false;
		} else {
		}
	});

	onMount(() => {
		lastY = Y;
	});
	afterNavigate(() => {
		// get head elements passed to <ZTocList>.
		headings = document.querySelectorAll(titles);
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
	<title>{'VH ' + $page.url.pathname.substring(1).replaceAll('/', ' · ')}</title>
</svelte:head>
<!-- #endregion -->
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
		<ZHeader>
			{#snippet home()}
				<ZBlurBtn>
					<a href="/">
						<ZIcon option={'home'} />
					</a>
				</ZBlurBtn>
			{/snippet}
			{#snippet nav()}
				<ZNav></ZNav>
			{/snippet}
			{#snippet themeToggle()}
				<ZThemeBtn />
			{/snippet}
			{#snippet layoutRight()}
				<ZBlurBtn
					onclick={() => {
						displays.display = !displays.display;
					}}
				>
					<ZIcon option={'layout'} />
				</ZBlurBtn>
			{/snippet}
			{#snippet layoutLeft()}
				<ZBlurBtn
					style={'transform: rotateY(180deg);'}
					onclick={() => {
						displays.displayToc = !displays.displayToc;
					}}
				>
					<ZIcon option={'layout'} />
				</ZBlurBtn>
			{/snippet}
			{#snippet github()}
				<ZBlurBtn>
					<a href="https://github.com/vhtmui">
						<ZIcon option={'github'} />
					</a>
				</ZBlurBtn>
			{/snippet}
		</ZHeader>
	</div>
</div>
<main
	onmouseenter={() => {
		stopReactScroll = false;
		timer = setTimeout(() => (top = -96), 1000);
	}}
	onmouseleave={() => clearTimeout(timer)}
>
	{#if displays.display}
		<div
			class="sidebar-container"
			transition:slide={{ duration: 300, axis: 'x' }}
			bind:clientWidth={SibarWidth}
		>
			<div class="sibar-innercontainer" style="width: {SibarWidth}px;">
				<ZSbarContainer treeArray={data.directory} signal="expandAll" width={`${SibarWidth}px`} />
			</div>
		</div>
	{/if}
	{#if !displays.display && windowWidth <= 768}
		<div class="mobilesidebar-container">
			<div
				bind:this={mobileSibar}
				bind:clientWidth={mobileSibarWidth}
				class="sibar-innercontainer"
				transition:slide|global={{ axis: 'x' }}
				onintroend={() => {
					addEventListener('click', clickOutsideMobileSibarHandler);
				}}
				onoutroend={() => {
					removeEventListener('click', clickOutsideMobileSibarHandler);
				}}
			>
				<ZSbarContainer
					treeArray={data.directory}
					signal="expandAll"
					width={`${mobileSibarWidth}px`}
				/>
			</div>
		</div>
	{/if}
	<div class="content">
		{@render children?.()}
	</div>
	{#if displays.displayToc}
		<div class="toc">
			{#if headings && headings?.length}
				<div class="tocContainer" transition:slide|global={{ duration: 300, axis: 'x' }}>
					<ZTocList {headings} indent="1" />
				</div>
			{/if}
		</div>
	{/if}
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
			/* pointer-events: none; */
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
				}
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
						color: var(--main-visited-a-color);
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
