<script>
	import ZSidebar from './ZSidebar.svelte';
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';

	import { get_childArray, getAll_propertyNames, buildTree } from './Znav';

	import { quadOut } from 'svelte/easing';

	/**
	 * @typedef {Object} Props
	 * @property {string} [signal]
	 * @property {string} [icon]
	 */

	/** @type {Props} */
	let { treeArray, signal = 'default', icon = 'plus' } = $props();

	let widther = $state(false);
	let input = $state('');

	let tree = buildTree({ _link: '/', _title: 'Home' }, treeArray);

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
			setExpand('default');
		}
	}
	function cleanInput() {
		input = '';
		// widther = false;
	}
	function topFly(node, { delay = 0, duration = 200 }) {
		return {
			delay,
			duration,
			easing: quadOut,
			css(t, u) {
				return `
					overflow: hidden;
					transform: scaleX(${t});
					transform-origin: left;
				`;
			}
		};
	}
	setExpand(signal);
	$effect(() => {
		if (input.length !== 0) {
			setExpand('expandAll');
		}
	});
</script>

<div class="sidebar right" transition:topFly|global={{ duration: 300 }}>
	<div class="sidebar-heard">
		<input
			bind:value={input}
			type="text"
			placeholder="filter"
			class:widther
			onclick={() => (widther = true)}
		/>
		<button type="button" class="clear-input" class:widther onclick={cleanInput}
			><ZIcon option="x" /></button
		>
		<button type="button" class="expand" onclick={toggle_expand}><ZIcon option={icon} /></button>
	</div>
	<div class="sibar">
		<ZSidebar {tree} {signal} filter={input} />
	</div>
</div>

<style>
	div.sidebar.right :global {
		width: 100%;
		div.sidebar-heard {
			padding-bottom: 2rem;
			display: flex;
			justify-content: space-around;
			& input {
				background-color: transparent;
				color: var(--main-text-color);
				border-radius: 0.5rem;
				border: 1px solid var(--main-text-color);
				font-size: medium;
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
			min-width: 5rem;
			max-height: calc(100vh - 8rem);
			overflow-y: auto;
			padding-top: 1rem;
			-webkit-mask-image: linear-gradient(180deg, #0000, #000 1rem calc(100% - 0.5rem), #0000);
			mask-image: linear-gradient(180deg, #0000, #000 1rem calc(100% - 0.5rem), #0000);
		}
	}
</style>
