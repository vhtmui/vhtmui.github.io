<script>
	import { root } from '../../routes/tree';
	import { get_childArray, getAll_propertyNames } from './nav';
	import Sidebar from './Sidebar.svelte';
	import Icon from '$lib/Icon/Icon.svelte';
	import { url } from './stores';

	export let tree;
	export let signal = 'default';
	export let icon = 'plus';

	let widther = false;
	let input = '';

	$: urll = ($url + '/').toString();
	$: tree = urll.substring(1, urll.indexOf('/', 1))
		? root[urll.substring(1, urll.indexOf('/', 1))]
		: root;

	if (signal === 'default') {
		icon = 'plus';
	} else if (signal === 'expandAll') {
		icon = 'minus';
	}

	function toggle_expand() {
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

<div class="sidebar right">
	<div class="sidebar-heard">
		<input
			bind:value={input}
			type="text"
			placeholder="filter" class:widther on:click={() => (widther = true)}
		/>
		<button class="clear-input" class:widther on:click={cleanInput}><Icon option="x" /></button>
		<button class="expand" on:click={toggle_expand}><Icon option={icon} /></button>
	</div>
	<div class="sibar">
		<Sidebar {tree} {signal} filter={input} />
	</div>
</div>

<style>
	div.sidebar.right {
		font-size: small;
		margin-right: auto;
		margin-left: auto;
		width: 100%;
		padding-top: 1rem;
		position: sticky;
		top: var(--header-block-height);
	}
	div.sidebar-heard {
		padding-bottom: 2rem;
		display: flex;
		justify-content: space-around;
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
			&:focus {
				border-color: var(--input-focus-color);
				outline: none;
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
			& path {
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
	div.sibar {
		overflow-y: auto;
		padding-top: 1rem;
		-webkit-mask-image:linear-gradient(180deg,#0000,#000 1rem calc(100% - 3rem),#0000);
		mask-image:linear-gradient(180deg,#0000,#000 1rem calc(100% - 1rem),#0000);
	}
</style>
