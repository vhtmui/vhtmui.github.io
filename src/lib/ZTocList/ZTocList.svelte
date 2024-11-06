<script module>
	let CurrentIndex;
</script>

<script>
	import { onDestroy, onMount } from 'svelte';

	/**
	 * @typedef {Object} Props
	 * @property {number} [indent]
	 * @property {number} [scrollTrigger]
	 * @property {NodeList} headings
	 */

	/** @type {Props} */
	let { indent = 1, scrollTrigger = 80, headings } = $props();

	/**
	 *  @type {Array} - an array indicate whitch item in the list should be heighlight.
	 */
	let classes = $state(Array(headings.length));
	let Y = $state();

	function getPadding(ele) {
		let n = Number(ele.nodeName.substr(1));
		return n;
	}

	$effect(() => {
		// highlight corresponding topic item while scrolling.
		for (let index = headings?.length - 1; index >= 0; index--) {
			if (Y - headings[index].offsetTop > -scrollTrigger ) {
				if (index !== CurrentIndex) {
					classes[index] = true;
					classes[CurrentIndex] = false;
					CurrentIndex = index;
				}
				break;
			}
		}
	});
</script>

<svelte:window bind:scrollY={Y} />

<div class="toc-container">
	{#if headings}
		{#each headings as head, i}
			<a
				class="tocItem {classes[i] ? 'scrollTo' : ''}"
				href="#{head.id}"
				style="padding-left: {getPadding(head) * indent}rem;">{head.textContent}</a
			><br />
		{/each}
	{/if}
</div>

<style>
	div.toc-container :global {
		font-size: 0.8rem;
		margin-top: 5rem;
		position: sticky;
		top: calc(var(--header-block-height) + 5rem);
		border-left: 1px solid #828282;
		& a.tocItem {
			display: inline-block;
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
			padding-right: 1rem;
			color: var(--tocItem-text-color);
			text-decoration: none;
			&:hover {
				color: var(--main-text-color);
			}
			&.scrollTo {
				color: var(--sidebar-selected-text-color);
			}
		}
	}
</style>
