<script>
	import Sidebar from './Sidebar.svelte';
	import { run } from 'svelte/legacy';

	import { getAll_propertyNames, get_childArray } from './nav';
	import { url } from './stores';
	import Icon from '$lib/Icon/Icon.svelte';
	import { slide } from 'svelte/transition';

	/**
	 * @typedef {Object} Props
	 * @property {Tree} tree
	 * @property {boolean} [expand]
	 * @property {string} [preLink]
	 * @property {boolean} [selected_item]
	 * @property {string} [signal]
	 * @property {string} [filter]
	 */

	/** @type {Props} */
	let {
		tree,
		preLink = '',
		selected_item = false,
		signal = 'default',
		filter = ''
	} = $props();

	let expand = $state(true);

	/**
	 * Indicate whether current node visable
	 */
	let visable = $state(true);

	/**
	 * The icon option
	 */
	let option = 'chevron_down';

	/**
	 * Plain html textContent of <a>
	 * @type {string}
	 */
	let title = $state();

	/**
	 * Icon direction
	 * @type {boolean}
	 */
	let IconUp = $derived(expand);

	/**
	 * An string includes all child object's links string of current tree object, divide with character '`'.
	 */
	let allChildNode = getAll_propertyNames(tree);

	/**
	 * For signal to determine if the page url include the href.
	 * @type {boolean}
	 */
	let include = $state(false);

	/**
	 * Relative links to the current component, also the href of <a>.
	 * @type {string}
	 */
	let nowLink = $derived((preLink + '/' + tree._link).replace(RegExp('/+'), '/'));

	/**
	 * @type {Tree}
	 */
	let child_tree = $derived(get_childArray(tree));

	function toggle_display() {
		expand = !expand;
	}

	//#region Filter
	// Filte the sidebar
	run(() => {
		if (filter.length !== 0) {
			if (allChildNode.match(RegExp(filter, 'i')) || tree._title.match(RegExp(filter, 'i'))) {
				visable = true;
			} else {
				visable = false;
			}
			const reg = RegExp(filter, 'i');
			const match = reg.exec(tree._title);
			title = tree._title.replace(reg, `<span class="highlightClass">${match}</span>`);
		} else if (filter.length === 0) {
			visable = true;
			title = tree._title;
		}
	});
	//#endregion

	//#region Show
	// A global signal to control the sidebar display.
	run(() => {
		if (signal === 'default') {
			// Determin by whether the url include the current link.
			include = $url.match(new RegExp(`^${nowLink}.*`));
		} else if (signal === 'expandAll') {
			include = true;
		} else if (signal === 'foldingAll' && nowLink !== '/') {
			include = false;
		}
	});

	// If include, expand current element
	$effect(() => {
		if (include) {
			expand = true;
		} else {
			expand = false;
		}
	});

	// Set hightlight item
	run(() => {
		if (nowLink === $url) {
			selected_item = true;
		} else if ($url.match(new RegExp(`^${nowLink}.+`, 'i')) && expand === false) {
			selected_item = true;
		} else {
			selected_item = false;
		}
	});
	//#endregion
</script>

<!-- {@debug expand} -->
<div id="Sidebar">
	{#if tree && visable}
		<div transition:slide|global class="tree-head">
			{#if child_tree}
				<button class:IconUp onclick={toggle_display}><Icon {option} /></button>
				<a class="sidebar" class:selected_item href={nowLink}>{@html title}</a>
			{:else}
				<div class="sidebar-paddingblock"></div>
				<a class="sidebar" class:selected_item href={nowLink}>{@html title}</a>
			{/if}
		</div>

		{#if expand && child_tree}
			<ul>
				{#each child_tree as t}
					<div>
						<div class="sidebar-paddingblock"></div>
						<li><Sidebar tree={t} preLink={nowLink} {signal} {filter} /></li>
					</div>
				{/each}
			</ul>
		{/if}
	{/if}
</div>

<style>
	div#Sidebar :global {
		& ul {
			list-style: none;
			margin: 0 0 0 1.125rem; /* Half width of the button */
			padding-left: 0;
			border-left: 1px solid var(--sidebar-border-left-color);
			/* border-top: 1px solid var(--sidebar-border-top-color); */
			/* border-bottom: 1px solid; */
		}
		& a.sidebar {
			text-decoration: none;
			color: var(----main-text-color);
			transition: all ease-in 0.2s;
			&:hover {
				text-decoration: underline;
			}
			& span.highlightClass {
				background-color: var(--sidebar-filter-text-bg-bolor);
				color: var(--sidebar-filter-text-bolor);
			}
		}
		& div.tree-head {
			display: flex;
			line-height: var(--sibar-block-height);
		}
		& div.sidebar-paddingblock {
			display: inline;
			width: 2.25rem;
			/* Equal to the width of the button  */
		}
		& a.selected_item {
			font-weight: bolder;
			padding: 0 1.2rem 0 1.2rem;
			color: var(--sidebar-selected-text-color);
			border-left: 10px;
			border-left-style: var(--sidebar-selected-border-style);
			border-color: var(--sidebar-selected-border-color);
			/* background-color: #7e7e7657; */
			transition: all ease-out 0.2s;
		}
		& button {
			box-sizing: border-box;
			margin: 0;
			padding: 0 0.5rem 0 0.5rem;
			height: var(--sibar-block-height);
			border: none;
			outline: none;
			background-color: transparent;
			transition: cubic-bezier(0.01, 0.79, 0.45, 0.94) 0.25s;
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
		& button.IconUp {
			transition: cubic-bezier(0.01, 0.79, 0.45, 0.94) 0.25s;
			transform: rotate(0deg);
		}
	}
</style>
