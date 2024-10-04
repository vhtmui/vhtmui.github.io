<script>
	import { afterUpdate, onMount } from 'svelte';
	// import { headings } from './stores';

	export const indent = 1;
	export const scrollTrigger = 80;
	export let headings;

	let prior;

	$: prior = headings[0].nodeName;

	function getHeadNum(ele) {
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
		addEventListener('DOMContentLoaded',()=>console.log('done'))
	});

</script>
<div class="toc-container">
	{#if headings}
		{#each headings as head}
			<a
				class="tocItem {head.classList}"
				href="#{head.id}"
				style="padding-left: {getHeadNum(head) * indent}rem;">{head.textContent}</a
			><br />
		{/each}
	{/if}
</div>

<style>
	div.toc-container {
		font-size: 0.9rem;
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
