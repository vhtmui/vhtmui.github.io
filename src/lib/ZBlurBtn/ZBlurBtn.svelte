<script>
	import { fade, slide } from 'svelte/transition';

	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let props = $props();
</script>

<button {...props}>
	{@render props.children?.()}
</button>

<style>
	button :global {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		height: var(--header-block-height);
		width: 3rem;
		border: none;
		border-radius: 0.7rem;
		outline: none;
		background-color: var(--header-btn-bg-color);
		backdrop-filter: blur(10px);
		display: flex;
		justify-content: center;
		align-items: center;
		&:hover {
			cursor: pointer;
			& path {
				fill: var(--header-text-hover-color);
				stroke: var(--header-text-hover-color);
			}
		}
		&:active {
			& path {
				fill: var(--header-text-active-color);
				stroke: var(--header-text-hover-color);
			}
		}
		& a {
			display: flex;
			width: 100%;
			height: 100%;
			align-items: center;
			justify-content: center;
		}
		& svg {
			vertical-align: middle;
			& * {
				fill: var(--all-svg-color);
				stroke: var(--all-svg-color);
			}
		}
	}
</style>
