<script>
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

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

	let pointerEvents = $state('auto');

	let actived = $state(false);

	/**
	 * To save configs
	 */
	function saveCfg() {
		cfg = snippets.map((sn) => {
			return {
				index: sn.index,
				start: sn.start
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
			start: localCfg ? localCfg[index].start : 0,
			length: 0
		}));
	});
	$effect(() => {
		// Init with default config if local config is null
		if (!localCfg) {
			for (let i = 1; i < snippets.length; i++) {
				snippets[i].start = snippets[i - 1]?.start + snippets[i - 1]?.length;
			}
			saveCfg();
		}
	});
</script>

<div id="rootHead">
	{#each snippets as snippet, i}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="headItem"
			style="left: {snippet.start}px;"
			style:pointer-events={pointerEvents}
			class:actived
			bind:this={snippet.ele}
			bind:clientWidth={snippet.length}
			onpointerdown={(e) => {
				e.preventDefault();
				if (e.button !== 0) return;

				let timer = setTimeout(() => {
					pointerEvents = 'none';
					actived = true;
					function seek(e) {
						const maxWidth = document.body.clientWidth;
						const length = snippet.length;
						snippet.start = e.clientX - snippet.length / 2;
						if (snippet.start < 0) snippet.start = 0;
						if (snippet.start > maxWidth - length) snippet.start = maxWidth - length;
					}
					window.addEventListener('pointermove', seek);
					window.addEventListener(
						'pointerup',
						(e) => {
							actived = false;
							e.preventDefault();
							pointerEvents = 'auto';
							window.removeEventListener('pointermove', seek);
							saveCfg();
						},
						{ once: true }
					);
				}, 200);

				window.addEventListener('pointerup', () => clearTimeout(timer));
				window.addEventListener('pointermove', () => clearTimeout(timer));
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
		.actived {
			transform: scale(1.5);
		}
	}
</style>
