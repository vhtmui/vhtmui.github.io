<script>
	import { root, get_childArray, getAll_propertyNames } from '../routes/nav';
	import Sidebar from './Sidebar.svelte';
	import Icon from './Icon.svelte';

	export let tree;

	let signal = 'default';
	let icon = 'plus';
	let widther = false;
	let input;

	function expand() {
		if (signal === 'default') {
			signal = 'expandAll';
			icon = 'minus';
		} else {
			signal = 'default';
			icon = 'plus';
		}
	}
</script>

<div class="sidebar-heard">
	<input bind:value={input} placeholder="filter" class:widther on:click|once={() => (widther = !widther)} />
	<button on:click={expand}><Icon option={icon} /></button>
</div>
<Sidebar {tree} {signal} filter = {input}/>

<style>
	div.sidebar-heard {
		padding-bottom: 1rem;
		display: flex;
		justify-content: space-between;
		& input {
			background-color: transparent;
			color: var(--main-text-color);
			border-radius: 1rem;
			border: 1px solid var(--main-text-color);
			font-size: large;
			font-family: 'Intel', 'Microsoft YaHei', Arial, sans-serif;
			height: 2rem;
			width: 4rem;
			padding-left: 1rem;
			padding-right: 1rem;
			box-shadow: none;
			transition: all linear 0.2s;
			&.widther {
				transition: all linear 0.2s;
				width: 100%;
			}
		}
		& button {
			box-sizing: border-box;
			margin: 0;
			padding: 0 1rem 0 1rem;
			height: 2rem;
			border: none;
			outline: none;
			background-color: transparent;
			transition: transform 0.3s ease;
			transform: rotate(0deg);
			&:hover {
				cursor: pointer;
				transform: rotate(180deg);
			}
			&:active {
				transition: none;
				transform: scale(1.5);
			}
		}
		& svg {
			vertical-align: middle;
			& path {
				fill: var(--all-svg-color);
			}
		}
	}
</style>
