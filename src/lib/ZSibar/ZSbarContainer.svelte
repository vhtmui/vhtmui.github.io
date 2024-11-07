<script>
	import ZSidebar from './ZSidebar.svelte';
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';

	import { root } from '../../routes/tree';
	import { get_childArray, getAll_propertyNames } from './Znav';
	
	import { quadOut } from 'svelte/easing';

	/**
	 * @typedef {Object} Props
	 * @property {string} [signal]
	 * @property {string} [icon]
	 */

	/** @type {Props} */
	let { signal = $bindable('default'), icon = $bindable('plus') } = $props();

	let widther = $state(false);
	let input = $state('');

	let tree = root;

	function setExpand(mode) {
		switch (mode) {
			case 'expandAll':
				signal = 'expandAll';
				icon = 'minus';
				break;
			case 'foldingAll':
				signal = 'foldingAll';
				icon = 'plus';
				break;
			default:
				signal = 'default';
				icon = 'plus';
				break;
		}
	}
	function toggle_expand() {
		if (signal !== 'expandAll') {
			setExpand('expandAll');
		} else {
			setExpand('foldingAll');
		}
	}
	function cleanInput() {
		input = '';
		widther = false;
	}
	function topFly(node, { delay = 0, duration = 200 }) {
		return {
			delay,
			duration,
			easing: quadOut,
			css(t, u) {
				return `
					transform: scaleX(${t});
					transform-origin: left;
				`;
			}
		};
	}
	setExpand('default');
	$effect(() => {
		if (input.length !== 0) {
			setExpand('expandAll');
		}
	});
</script>

<div class="sidebar right" transition:topFly|global={{ duration: 300, delay: 70 }}>
	<div class="sidebar-heard">
		<input
			bind:value={input}
			type="text"
			placeholder="filter"
			class:widther
			onclick={() => (widther = true)}
		/>
		<button type="button" class="clear-input" class:widther onclick={cleanInput}><ZIcon option="x" /></button>
		<button type="button" class="expand" onclick={toggle_expand}><ZIcon option={icon} /></button>
	</div>
	<div class="sibar">
		<ZSidebar {tree} {signal} filter={input} />
	</div>
</div>

<style>
	div.sidebar.right :global {
		font-size: small;
		/* margin-right: auto;
		margin-left: auto; */
		/* width: min(calc((100% - 4rem) * 0.2), calc(0.2 * (var(--main-max-width) - 4rem))); */
		width: 100%;
		padding-top: 1rem;
		padding-right: 1vw;
		/* max-height: 100vh;
		overflow: auto; */
		/* position: fixed; */
		/* top: var(--header-block-height); */
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
				margin-left: 1rem;
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
				right: calc(3.3rem + 1vw);
				box-sizing: border-box;
				margin: 0;
				padding: 0 0.5rem 0 0.5rem;
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
				padding: 0 0.5rem 0 0.5rem;
				height: 2rem;
				border: none;
				outline: none;
				background-color: transparent;
				transition: transform 300ms ease 70ms;
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
			max-height: calc(100vh - 8rem);
			overflow-y: auto;
			padding-top: 1rem;
			-webkit-mask-image: linear-gradient(180deg, #0000, #000 1rem calc(100% - 3rem), #0000);
			mask-image: linear-gradient(180deg, #0000, #000 1rem calc(100% - 1rem), #0000);
		}
	}
</style>
