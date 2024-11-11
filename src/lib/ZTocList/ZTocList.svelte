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

	/**
	 * @type {number} - indicate the index of current hightlight item.
	 */
	let CurrentIndex = $state();

	let tocContainer;

	let As = $state(Array(headings.length));

	/**
	 * @type {number} - binded to the `window.scrollY`.
	 */
	let Y = $state();

	function getPadding(ele) {
		let n = Number(ele.nodeName.substr(1));
		return n;
	}

	$effect(() => {
		// highlight corresponding topic item while scrolling.
		for (let index = headings?.length - 1; index >= 0; index--) {
			if (Y - headings[index].offsetTop > -scrollTrigger) {
				if (index !== CurrentIndex) {
					classes[index] = true;
					classes[CurrentIndex] = false;
					CurrentIndex = index;

					let timer;
					if (timer) {
						clearTimeout(timer);
					}
					timer = setTimeout(() => {
						const height = tocContainer.clientHeight / 2;

						tocContainer.scroll({ top: As[CurrentIndex].offsetTop - height, behavior: 'smooth' });
					}, 200);
				}
				break;
			}
		}
	});
</script>

<svelte:window bind:scrollY={Y} />

<div class="toc-container" bind:this={tocContainer}>
	{#if headings}
		{#each headings as head, i}
			<a
				bind:this={As[i]}
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
		overflow-y: auto;
		height: 70vh;
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
