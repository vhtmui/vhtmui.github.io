<script>
	import { get_child_array } from '../routes/nav';
	import Icon from './Icon.svelte';

	export let tree;
	export let display = false;
	export let preLink = '';

	let child_tree = get_child_array(tree);
	let option = 'chevron_down';
	let up = false;

	let nowLink = preLink + '/' + tree.$link;

	function toggle_display() {
		display = !display;
		up = !up;
	}
</script>

{#if tree}
	<a href={nowLink}>{tree.$title}</a>
	{#if child_tree}
		<button class:up on:click={toggle_display}><Icon {option} /></button>
	{/if}

	{#if display && child_tree}
		<ul>
			{#each child_tree as t}
				<li><svelte:self tree={t} preLink={nowLink} /></li>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	ul {
		list-style: none;
		margin: 0;
		padding-left: 1rem;
		border-left: 1px solid;
	}
	button {
		box-sizing: border-box;
		margin: 0;
		padding: 0 1rem 0 1rem;
		border: none;
		outline: none;
		background-color: transparent;
		transition: cubic-bezier(0.01, 0.79, 0.45, 0.94) 0.25s;
		transform: rotate(-90deg);
		& path {
			fill: var(--all-svg-color);
		}
		& :hover {
			cursor: pointer;
		}
	}
	button.up {
		transition: cubic-bezier(0.01, 0.79, 0.45, 0.94) 0.25s;
		transform: rotate(0deg);
	}
</style>
