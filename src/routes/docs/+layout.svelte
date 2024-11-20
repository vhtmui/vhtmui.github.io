<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').LayoutData} data
	 */

	/** @type {Props} */
	let { data, ...props } = $props();
</script>

{@render props.children?.()}

<style>

</style>
