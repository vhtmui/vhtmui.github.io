<script>
	import ZSidebar from './ZSidebar.svelte';
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';
	import { scaleX } from '$lib/Z-transitions';

	import { Tree } from './Ztree';

	/**
	 * @typedef {Object} Props
	 * @property {string} [signal]
	 * @property {string} [icon]
	 */

	/** @type {Props} */
	let { Dirs, signal = 'default', icon = 'plus', width = '100%' } = $props();

	let widther = $state(false);
	let input = $state('');

	let tree = $state(new Tree(Dirs));
	tree.title = 'Home';

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
	setExpand(signal);
	$effect(() => {
		if (input.length !== 0) {
			setExpand('expandAll');
		}
	});
</script>

<div class="sidebar right" transition:scaleX|global={{ duration: 300 }}>
	<div class="sidebar-heard" style="width: {width}">
		<input
			bind:value={input}
			type="text"
			placeholder="filter"
			class:widther
			onclick={() => (widther = true)}
		/>
		<button type="button" class="clear-input" class:widther onclick={() => (input = '')}
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
				right: 3.3rem;
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
			max-height: 60vh;
			overflow-y: auto;
			padding-top: 1rem;
			-webkit-mask-image: linear-gradient(180deg, #0000, #000 1rem calc(100% - 0.5rem), #0000);
			mask-image: linear-gradient(180deg, #0000, #000 1rem calc(100% - 0.5rem), #0000);
		}
	}
</style>
