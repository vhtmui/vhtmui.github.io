<script>
	import ZSidebar from './ZSidebar.svelte';
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';

	import { slide } from 'svelte/transition';
	import { quadOut } from 'svelte/easing';
	import { page } from '$app/stores';

	/**
	 * @typedef {Object} Props
	 * @property {import('./Ztree').Tree} tree
	 * @property {string} [preLink]
	 * @property {boolean} [selected_item]
	 * @property {string} [signal]
	 * @property {string} [filter]
	 */

	/** @type {Props} */
	let { tree, preLink = '', selected_item = false, signal = 'default', filter = '' } = $props();

	let expand = $state(false);

	/**
	 * Indicate could current node visabled.
	 */
	let visable = $state(true);

	/**
	 * Plain html textContent of <a>
	 * @type {string}
	 */
	let title = $state(tree.title);

	/**
	 * ZIcon direction
	 * @type {boolean}
	 */
	let IconUp = $derived(expand);

	/**
	 * An string includes all child object's links string of current tree object and current title, divide with character '`'.
	 */
	const allChildTitle = [...tree.getAllChildTitle()].join('`');

	/**
	 * Link relative to the root, also the property `href` of <a>.
	 * @type {string}
	 */
	const nowLink = tree.link;

	/**
	 * @type {Array<Tree>} - child tree array.
	 */
	const child_tree = tree.children;

	function toggle_display() {
		expand = !expand;
	}

	//#region Filter
	// Filte the sidebar
	$effect(() => {
		if (filter.length !== 0) {
			const pattern = RegExp(
				filter.replace(/\[|\.|\*|\+|\?|\^|\$|\{|\}|\(|\)|\||\\|\]/g, '\\$&'),
				'i'
			);
			if (allChildTitle.search(pattern) + 1) {
				visable = true;
			} else {
				visable = false;
			}
			const match = pattern.exec(tree.title);
			title = tree.title.replace(pattern, `<span class="highlightClass">${match}</span>`);
		} else {
			visable = true;
			title = tree.title;
		}
	});
	//#endregion

	//#region Show
	// A global signal to control the sidebar display.
	$effect(() => {
		if (signal === 'default') {
			// Determin by whether the url include the current link.
			expand = $page.route.id.match(new RegExp(`^${nowLink}.*`));
		} else if (signal === 'expandAll') {
			expand = true;
		} else if (signal === 'foldingAll' && nowLink !== '/') {
			expand = false;
		}
	});

	// Indicate if current tree is selected.
	$effect(() => {
		const url = new URL($page.url);
		if (nowLink === url.pathname) {
			selected_item = true;
		} else if ($page.route.id.match(new RegExp(`^${nowLink}.+`, 'i')) && expand === false) {
			selected_item = true;
		} else {
			selected_item = false;
		}
	});
	//#endregion
</script>

<div id="Sidebar">
	{#if tree && visable}
		<div transition:slide|global={{ easing: quadOut, duration: 300 }} class="tree-head">
			{#if child_tree.length}
				<button class:IconUp onclick={toggle_display}><ZIcon option="chevron_down" /></button>
				<a class="sidebar" class:selected_item href={nowLink}>{@html title}</a>
			{:else}
				<div class="sidebar-paddingblock"></div>
				<a class="sidebar" class:selected_item href={nowLink}>{@html title}</a>
			{/if}
		</div>

		{#if expand && child_tree.length}
			<ul>
				{#each child_tree as t}
					<div>
						<div class="sidebar-paddingblock"></div>
						<li><ZSidebar tree={t} preLink={nowLink} {signal} {filter} /></li>
					</div>
				{/each}
			</ul>
		{/if}
	{/if}
</div>

<style>
	div#Sidebar :global {
		ul {
			list-style: none;
			margin: 0 0 0 1.125rem; /* Half width of the button */
			padding-left: 0;
			border-left: 1px solid var(--sidebar-border-left-color);
		}
		a.sidebar {
			text-decoration: none;
			color: var(--sidebar-text-color);
			transition: all cubic-bezier(0.165, 0.84, 0.44, 1) 300ms 70ms;
			&:hover {
				text-decoration: underline;
			}
			& span.highlightClass {
				background-color: var(--sidebar-filter-text-bg-bolor);
				color: var(--sidebar-filter-text-bolor);
			}
		}
		div.tree-head {
			display: flex;
			line-height: var(--sibar-block-height);
		}
		div.sidebar-paddingblock {
			display: inline;
			width: 2.25rem;
			/* Equal to the width of the button  */
		}
		a.selected_item {
			font-weight: bolder;
			font-size: large;
			padding: 0 1.2rem 0 0.8rem;
			color: var(--sidebar-selected-text-color);
			border-left: 10px;
			border-left-style: var(--sidebar-selected-border-style);
			border-color: var(--sidebar-selected-border-color);
			transition: all cubic-bezier(0.165, 0.84, 0.44, 1) 300ms 70ms;
		}
		button {
			box-sizing: border-box;
			margin: 0;
			padding: 0 0.5rem 0 0.5rem;
			height: var(--sibar-block-height);
			border: none;
			outline: none;
			background-color: transparent;
			transition: cubic-bezier(0.165, 0.84, 0.44, 1) 300ms 70ms;
			transform: rotate(-90deg);
			& svg {
				vertical-align: middle;
			}
			& path {
				fill: var(--sidebar-svg-color);
			}
			&:hover {
				cursor: pointer;
			}
		}
		button.IconUp {
			transition: cubic-bezier(0.165, 0.84, 0.44, 1) 300ms 70ms;
			transform: rotate(0deg);
		}
	}
</style>
