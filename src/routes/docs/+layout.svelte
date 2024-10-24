<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').LayoutData} data
	 */

	/** @type {Props} */
	let { data, ...props } = $props();
</script>

<div class="header">Sticky Header</div>
<div class="content">Scroll down to see the sticky header in action.</div>

{@render props.children?.()}

<style>

</style>
