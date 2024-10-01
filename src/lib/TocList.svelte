<script>
	import { onMount } from 'svelte';

	let headings;
	let prior;

	onMount(() => {
		headings = document.querySelectorAll('h2, h3, h4, h5, h6');
		prior = headings[0].nodeName;
	});

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

			<span class="tocItem" style="padding-left: {getHeadNum(head)}rem;">{head.textContent}</span><br />
		{/each}
	{/if}
</div>

<style>
	div.toc-container {
		& span.tocItem {
			display: inline-block;
		}
	}
</style>
