<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	let { data } = $props();
</script>

<ul>
	{#each data.mdContent as md}
		<li><a href="docs/{md.doc}">{md.doc}</a></li>
	{/each}
</ul>
