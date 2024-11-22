<script>
	import { fade, slide } from 'svelte/transition';

	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { style, width, ...props } = $props();
</script>

<button type="button" {...props} style="width: {width}; {style}">
	{@render props.children?.()}
</button>

<style>
	button :global {
		font-family: unset;
		font-size: unset;
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		height: var(--header-block-height);
		width: 3rem;
		border: none;
		border-radius: 0.7rem;
		outline: none;
		background-color: var(--header-btn-bg-color);
		backdrop-filter: blur(5px);
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
	}
</style>
