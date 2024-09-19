<script>
	import { afterUpdate, beforeUpdate } from 'svelte';
	import { get_child_array } from '../routes/nav';
	import Icon from './Icon.svelte';

	export let tree;
	export let display = false;
	export let preLink = '';

	let child_tree = get_child_array(tree);
	let option = 'chevron_down';
	let up = false;
	let url;

	let nowLink = preLink + '/' + tree.$link;

	function toggle_display() {
		display = !display;
		up = !up;
	}
	afterUpdate(()=>{
		url = window.location.href
	})
</script>
{url}
{#if tree}
	<div class="tree-head">
		
		{#if child_tree}
			<button class:up on:click={toggle_display}><Icon {option} /></button>
			<a class="sidebar" href={nowLink}>{tree.$title}</a>
		{:else}
			<div class = 'sidebar-paddingblock'></div><a class="sidebar" href={nowLink}>{tree.$title}</a>
		{/if}
		
	</div>

	{#if display && child_tree}
		<ul>
			{#each child_tree as t}
				<div class = 'sidebar-paddingblock'> </div><li><svelte:self tree={t} preLink={nowLink} /></li>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	ul {
		list-style: none;
		margin: 0 0 0 1.125rem; /* 侧边栏关联样式，保证svg图像对齐边框*/
		padding-left: 0.0;
		border-collapse: collapse;
		border-left: 1px solid var(--sidebar-border-left-color);
		/* border-top: 1px solid var(--sidebar-border-top-color); */
		/* border-bottom: 1px solid; */
		& li {
			
		}
	}
	a.sidebar {
		text-decoration: none;
		color: var(----main-text-color);
		&:hover {
			text-decoration: underline;
		}
	}
	div.tree-head{
		display: flex;
		line-height: 3rem;
	}
	div.sidebar-paddingblock{
		display: inline;
		width: 2.25rem;
		/* 侧边栏关联样式，保证列表每项文字对齐 */
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
		& svg{
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
