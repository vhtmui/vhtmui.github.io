<script>
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';

	let { children, ...others } = $props();

	let fns = Object.values(others);

	/**
	 * An array of snippets containing properties to configure the snippet layout.
	 * @type {Array<Object>}
	 * @property {function} fn - Function passed from caller.
	 * @property {HTMLDivElement} ele - Varriable bind to the <div>.
	 * @property {number} index - The index of the code snippet.
	 * @property {number} start - The starting position of the code snippet.
	 */
	let snippets = $state(new Map());

	/**
	 * @type {string}
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

	/**
	 * To save configs
	 */
	function saveCfg() {
		cfg = snippets.map((sn) => {
			return {
				index: sn.index,
				start: sn.$start
			};
		});
		localStorage.setItem('hcfg', JSON.stringify(cfg));
	}

	onMount(() => {
		// Get config
		try {
			localCfg = JSON.parse(localStorage.getItem('hcfg'));
		} catch {
			localCfg = null;
		}
	});
	$effect(() => {
		// Build `snippets` data structure
		snippets = fns.map((fn, index) => ({
			fn: fn,
			ele: null,
			index: index,
			start: localCfg ? spring(localCfg[index].start) : spring(0),
			length: 0,
			pointerEvents: 'auto',
			actived: false
		}));
	});
	$effect(() => {
		// Init with default config if local config is null
		if (!localCfg) {
			for (let i = 1; i < snippets.length; i++) {
				snippets[i].$start = snippets[i - 1]?.$start + snippets[i - 1]?.length;
			}
			saveCfg();
		}
	});
	let a = spring(0);
	$inspect(a);
</script>

<div id="rootHead">
	{#each snippets as snippet, i}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="headItem"
			style="left: {snippet.$start}px;"
			style:pointer-events={snippet.pointerEvents}
			class:actived={snippet.actived}
			bind:this={snippet.ele}
			bind:clientWidth={snippet.length}
			onpointerdown={(e) => {
				if (e.button !== 0) return;
				e.preventDefault();

				const gap = snippet.$start - e.clientX;
				const maxWidth = document.body.clientWidth;
				const length = snippet.length;
				function seek(e) {
					// Prevent actions.
					snippet.pointerEvents = 'none';
					snippet.actived = true;
					snippet.$start = e.clientX + gap;
					if (snippet.$start < 0) snippet.$start = 0;
					if (snippet.$start > maxWidth - length) snippet.$start = maxWidth - length;
				}
				window.addEventListener('pointermove', seek);
				window.addEventListener(
					'pointerup',
					(e) => {
						snippet.actived = false;
						e.preventDefault();
						snippet.pointerEvents = 'auto';
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
			transition:
				transform ease-out 200ms,
				opacity ease-out 200ms;
			transform: none;
			opacity: 1;
			position: absolute;
		}
		.actived {
			transition:
				transform ease-out 200ms,
				opacity ease-out 200ms;
			z-index: 99;
			transform: scale(0.92);
			opacity: 0.7;
			border-bottom: 2px solid var(--header-block-movable-color);
		}
	}
</style>
