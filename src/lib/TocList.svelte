<script>
	import { afterUpdate, onMount } from 'svelte';

	export const indent = 1;
	export let headings;

	let prior;

	$: if (headings !== '$undefined' && headings) {
		prior = headings[0].nodeName;
	} else {
		headings = null;
	}

	function updatePrior(ele) {
		const result = ele.nodeName > prior;

		prior = ele.nodeName;

		return result;
	}

	function getHeadNum(ele) {
		let n = Number(ele.nodeName.substr(1));
		return n;
	}
</script>

<div class="toc-container">
	{#if headings}
		{#each headings as head}
			<a class="tocItem" href="#{head.id}" style="padding-left: {getHeadNum(head) * indent}rem;"
				>{head.textContent}</a
			><br />
		{/each}
	{/if}
</div>

<style>
	div.toc-container {
		font-size: small;
		margin-top: 5rem;
		position: sticky;
		top: calc(var(--header-block-height) + 5rem);
		border-left: 1px solid #828282;
		& a.tocItem {
			display: inline-block;
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
			padding-right: 1rem;
			color: var(--main-text-color);
			text-decoration: none;
			&:hover {
				text-decoration: underline;
				color: var(--sidebar-selected-text-color);
			}
		}
	}
</style>
