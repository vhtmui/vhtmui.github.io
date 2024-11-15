<script>
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';
	import { get } from 'svelte/store';

	let { children, ...others } = $props();

	let fns = Object.values(others);

	/**
	 * An array of snippets containing properties to configure the snippet layout.
	 * @typedef {Object} Snippet
	 * @property {function} fn - Function passed from caller.
	 * @property {HTMLDivElement} ele - Varriable bind to the <div>.
	 * @property {number} start - The starting position of the code snippet.
	 * @property {number} lenght - Bind to the element's clientLength.
	 * @property {string} pointerEvents - Indicate the `pointer-events` attribute of the container of each snippet.
	 * @property {boolean} actived - The class.
	 */

	/**
	 * @type {Snippet[]}
	 */
	let snippets = $state(new Map());

	/**
	 * An array of configurations derived from the original snippets array,
	 * contains `start` position of each element.
	 * @type {Array<number>}
	 */
	let cfg = $state(Array(Object.keys(others).length));

	let starts = $state(Array(Object.keys(others).length));

	/**
	 * To save configs
	 */
	function saveCfg() {
		cfg = snippets.map((sn) => {
			return get(sn.start);
		});
		localStorage.setItem('hcfg', JSON.stringify(cfg));
	}

	// Build `snippets` data structure
	snippets = fns.map((fn) => {
		return {
			fn: fn,
			ele: null,
			start: spring(0,{stiffness: 0.1,damping: 0.3}),
			length: 0,
			pointerEvents: 'auto',
			actived: false
		};
	});

	for (let i = 0; i < starts.length; i++) {
		snippets[i].start.subscribe((value) => {
			starts[i] = value;
		});
	}

	onMount(() => {
		// Get config
		// Init with default config if local config is null
		if (localStorage.getItem('hcfg')) {
			let localCfg = JSON.parse(localStorage.getItem('hcfg'));
			for (let index = 0; index < Object.keys(others).length; index++) {
				snippets[index].start.set(localCfg[index]);
			}
		} else {
			let initLength = 0;
			for (let i = 0; i < Object.keys(others).length; i++) {
				i === 0 ? (initLength = 0) : (initLength += snippets[i - 1].length);
				snippets[i].start.set(initLength);
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
			style="left: {starts[i]}px;"
			style:pointer-events={snippet.pointerEvents}
			class:actived={snippet.actived}
			bind:this={snippet.ele}
			bind:clientWidth={snippet.length}
			onpointerdown={(e) => {
				if (e.button !== 0) return;
				e.preventDefault();

				const gap = starts[i] - e.clientX;
				const maxWidth = document.body.clientWidth;
				const length = snippet.length;
				function seek(e) {
					// Prevent actions.
					snippet.pointerEvents = 'none';
					snippet.actived = true;
					snippet.start.set(e.clientX + gap);
					if (starts[i] < 0) snippet.start.set(0);
					if (starts[i] > maxWidth - length) snippet.start.set(maxWidth - length);
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
