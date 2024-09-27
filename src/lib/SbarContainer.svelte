<script>
	import { root, get_childArray, getAll_propertyNames } from '../routes/nav';
	import Sidebar from './Sidebar.svelte';
	import Icon from './Icon.svelte';

	export let tree;

	let signal = 'default';
	let icon = 'plus';
	let widther = false;
	let input = '';

	function expand() {
		if (signal === 'default') {
			signal = 'expandAll';
			icon = 'minus';
		} else {
			signal = 'default';
			icon = 'plus';
		}
	}
	function cleanInput() {
		input = '';
		widther = false;
	}

	$: if (input.length !== 0) {
		signal = 'expandAll';
		icon = 'minus';
	}
</script>

<div class="sidebar-heard">
	<input bind:value={input} placeholder="filter" class:widther on:click={() => (widther = true)} />
	<button class="clear-input" class:widther on:click={cleanInput}><Icon option="x" /></button>
	<button class="expand" on:click={expand}><Icon option={icon} /></button>
</div>
<Sidebar {tree} {signal} filter={input} />

<style>
	div.sidebar-heard {
		padding-bottom: 1rem;
		display: flex;
		justify-content:flex-end;
		& input {
			background-color: transparent;
			color: var(--main-text-color);
			border-radius: 0.5rem;
			border: 1px solid var(--main-text-color);
			font-size: small;
			font-family: 'Intel', 'Microsoft YaHei', Arial, sans-serif;
			height: 2rem;
			width: 5.5rem;
			margin-right: 1rem;
			padding-left: 0.4rem;
			padding-right: 2rem;
			box-shadow: none;
			&.widther {
				width: 100%;
			}
			&:target{
				border-color: aqua;
			}
		}
		& button.clear-input {
			visibility: hidden;
			position: absolute;
			right: 3rem;
			box-sizing: border-box;
			margin: 0;
			padding: 0 0.5rem 0 0.5 rem;
			height: 2rem;
			border: none;
			outline: none;
			background-color: transparent;
			&.widther {
				visibility: visible;
			}
			&:hover {
				cursor: pointer;
				transform: none;
				background-color: #80808075;
				border-radius: 0.5rem;
			}
			&:active {
				transition: none;
			}
			& path{
				fill: var(--sidebar-svg-color);
			}
		}
		& button.expand {
			box-sizing: border-box;
			margin: 0;
			padding: 0 0.5rem 0 0.5 rem;
			height: 2rem;
			border: none;
			outline: none;
			background-color: transparent;
			transition: transform 0.3s ease;
			transform: rotate(0deg);
			&:hover {
				cursor: pointer;
				transform: rotate(180deg);
				background-color: #80808075;
				border-radius: 0.5rem;
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
