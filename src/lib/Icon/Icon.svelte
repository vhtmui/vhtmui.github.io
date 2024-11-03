<script>
	// @ts-nocheck
	import { paths, viewBoxs } from './icon';


	/**
	 * @typedef {Object} Props
	 * @property {string} [option]
	 * @property {string} [height]
	 * @property {string} [width]
	 */

	/** @type {Props} */
	let { option = 'sun', height = '1.25rem', width = '1.25rem' } = $props();

	let viewBox = $derived(viewBoxs[option]);
	let path = $derived(paths[option]);
</script>

<svg {viewBox} {height} {width}>{@html path}</svg>

<style>
</style>
