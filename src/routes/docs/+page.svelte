<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	let { data } = $props();
</script>

<svelte:head>
	<title>Docs</title>
</svelte:head>

{#each data.dir as dir }
    <p>{dir}</p>
{/each}
