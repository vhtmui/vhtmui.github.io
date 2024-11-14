<script>
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let { children, ...others } = $props();

	let fns = Object.values(others);

	let snippets = $state(new Map());

	

	/**
	 * @type
	 */
	let localCfg = $state();

	/**
	 * An array of configuration objects derived from the original snippets array,
	 * each containing the index and start position of a code snippet.
	 * @type {Array<Object>}
	 * @property {number} index - The index of the code snippet.
	 * @property {number} start - The starting position of the code snippet.
	 */
	let cfg;

	function saveCfg() {
		cfg = snippets.map((sn) => {
			return {
				index: sn.index,
				start: sn.position.start
			};
		});
		localStorage.setItem('hcfg', JSON.stringify(cfg));
	}

	$effect(() => {
		// update position or init with localStorage
		snippets = fns.map((fn, index) => ({
			fn: fn,
			ele: null,
			index: index,
			position: {
				start: localCfg ? localCfg[index].start : 0,
				length: 0
			}
		}));
	});
	onMount(() => {
		// get config
		localCfg = JSON.parse(localStorage.getItem('hcfg'));
		// if none init with default
		if (!localCfg) {
			for (let i = 1; i < snippets.length; i++) {
				snippets[i].position.start =
					snippets[i - 1]?.position.start + snippets[i - 1]?.position.length;
			}
			saveCfg();
		}
	});
	$inspect(localCfg);
</script>

<div id="rootHead">
	{#each snippets as snippet, i}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="headItem"
			style="left: {snippet.position.start}px;"
			bind:this={snippet.ele}
			bind:clientWidth={snippet.position.length}
			onpointerdown={(e) => {
				e.preventDefault();

				function seek(e) {
					snippet.position.start = e.clientX - snippet.position.length / 2;
				}

				window.addEventListener('pointermove', seek);

				window.addEventListener(
					'pointerup',
					() => {
						window.removeEventListener('pointermove', seek);
						saveCfg();
					},
					{ once: true }
				);
			}}
		>
			{@render snippet.fn()}
		</div>
	{/each}
</div>

<style>
	div#rootHead {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 100%;
		.headItem {
			position: absolute;
		}
	}
</style>
