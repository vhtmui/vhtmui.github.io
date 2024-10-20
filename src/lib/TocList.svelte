<script>
	import { afterUpdate, onMount } from 'svelte';

	/**
	 * @type {number} - Indicate the indent raito
	 */
	export let indent = 1;
	
	/**
	 * @type {number} scrollTrigger - Indicate the threshold for triggering hightlight
	 */
	export let scrollTrigger = 80;

	/**
	 * @type {NodeList} - Collection of HeadingElement nodes
	 */
	export let headings;

	function getPadding(ele) {
		let n = Number(ele.nodeName.substr(1));
		return n;
	}

	function setTocItem() {
		const a = document.querySelectorAll('a.tocItem');
		let flag = false;
		for (let index = headings.length - 1; index >= 0; index--) {
			if (window.scrollY - headings[index].offsetTop > -scrollTrigger && !flag) {
				a[index].classList.add('scrollTo');
				flag = true;
			} else {
				a[index].classList.remove('scrollTo');
			}
		}
	}

	onMount(() => {
		addEventListener('scroll', setTocItem);
		setTocItem();
	});
</script>

<div class="toc-container">
	{#if headings}
		{#each headings as head}
			<a
				class="tocItem {head.classList}"
				href="#{head.id}"
				style="padding-left: {getPadding(head) * indent}rem;">{head.textContent}</a
			><br />
		{/each}
	{/if}
</div>

<style>
	div.toc-container {
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
