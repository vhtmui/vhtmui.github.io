<script>
	import { paths, viewBoxs } from './Zicon';

	import gsap from 'gsap';

	/**
	 * @typedef {Object} Props
	 * @property {string} [option]
	 * @property {string} [height]
	 * @property {string} [width]
	 */

	/** @type {Props} */
	let { option = 'sun', height = '1.25rem', width = '1.25rem', ...others } = $props();
// .replace(/\d+/g, (match) => parseInt(match, 10) * 2.4)
	let viewBox = $derived(viewBoxs[option]);
	let path = $derived(paths[option]);

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svg {...others} {viewBox} {height} {width}>{@html path}</svg>

<style>
</style>
