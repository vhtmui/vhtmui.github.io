<script>
	import { getAll_propertyNames, get_childArray } from './nav';
	import { url } from '$lib/stores';
	import Icon from './Icon.svelte';
	import { slide } from 'svelte/transition';

	export let tree;
	export let expand = false;
	export let preLink = '';
	export let selected_item = false;
	export let signal = 'default';
	export let filter = '';

	let option = 'chevron_down';

	let up = false;

	/**
	 * An string includes all child object's links of this object 'tree', divide with character '`'.
	 * @param {string} allChildNode
	 */
	let allChildNode = getAll_propertyNames(tree);
	let visable = true;

	/**
	 * For signal to determine if the href equal to page url.
	 * @param {boolean} equal
	 */
	let equal = false;

	/**
	 * For signal to determine if the page url include the href.
	 * @param {boolean} include
	 */
	let include = false;

	/**
	 * Relative links to the current component, also the href of <a>.
	 * @param {string} nowLink
	 */
	$: nowLink = (preLink + '/' + tree._link).replace(RegExp('/+'), '/');

	/**
	 * @param {Tree} child_tree
	 */
	$: child_tree = get_childArray(tree);

	function toggle_display() {
		expand = !expand;
		up = !up;
	}

	// Filte the sidebar
	$: if (filter.length !== 0) {
		if (allChildNode.match(RegExp(filter, 'i')) || tree._title.match(RegExp(filter, 'i'))) {
			visable = true;
		} else {
			visable = false;
		}
	} else if (filter.length === 0) {
		visable = true;
	}

	// A global signal to control the sidebar display.
	$: if (signal === 'default') {
		equal = nowLink === $url;
		include = $url.match(new RegExp(`^${nowLink}.+`));
	} else if (signal === 'expandAll') {
		equal = false;
		include = true;
	}

	// decide whether to expand by default,
	// if the url is equal, then select this element,
	// if the element's url is included by page's, then expand it, and if it's expanded, then no select it
	$: if (equal) {
		// expand = false;
		// up = false;
	} else if (include) {
		expand = true;
		up = true;
	} else {
		expand = false;
		up = false;
	}

	$: if (nowLink === $url) {
		selected_item = true;
	} else if ($url.match(new RegExp(`^${nowLink}.+`, 'i')) && expand === false) {
		selected_item = true;
	} else {
		selected_item = false;
	}
</script>

{#if tree && visable}
	<div transition:slide|global class="tree-head">
		{#if child_tree}
			<button class:up on:click={toggle_display}><Icon {option} /></button>
			<a class="sidebar" class:selected_item href={nowLink}>{tree._title}</a>
		{:else}
			<div class="sidebar-paddingblock"></div>
			<a class="sidebar" class:selected_item href={nowLink}>{tree._title}</a>
		{/if}
	</div>

	{#if expand && child_tree}
		<ul>
			{#each child_tree as t}
				<div>
					<div class="sidebar-paddingblock"></div>
					<li><svelte:self tree={t} preLink={nowLink} {signal} {filter} /></li>
				</div>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	ul {
		list-style: none;
		margin: 0 0 0 1.125rem; /* Half width of the button */
		padding-left: 0;
		border-left: 1px solid var(--sidebar-border-left-color);
		/* border-top: 1px solid var(--sidebar-border-top-color); */
		/* border-bottom: 1px solid; */
	}
	a.sidebar {
		text-decoration: none;
		color: var(----main-text-color);
		transition: all ease-in 0.2s;
		&:hover {
			text-decoration: underline;
		}
	}
	div.tree-head {
		display: flex;
		line-height: 3rem;
	}
	div.sidebar-paddingblock {
		display: inline;
		width: 2.25rem;
		/* Equal to the width of the button  */
	}
	a.selected_item {
		font-weight: bolder;
		padding: 0 1.2rem 0 1.2rem;
		color: var(--sidebar-selected-text-color);
		border-left: 10px;
		border-left-style: var(--sidebar-selected-border-style);
		border-color: var(--sidebar-selected-border-color);
		/* background-color: #7e7e7657; */
		transition: all ease-out 0.2s;
	}
	button {
		box-sizing: border-box;
		margin: 0;
		padding: 0 0.5rem 0 0.5rem;
		height: var(--header-block-height);
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
	button.up {
		transition: cubic-bezier(0.01, 0.79, 0.45, 0.94) 0.25s;
		transform: rotate(0deg);
	}
</style>
