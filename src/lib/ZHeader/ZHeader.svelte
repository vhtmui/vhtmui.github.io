<script>
	import { onMount } from 'svelte';
	import { quadOut } from 'svelte/easing';
	import { spring, tweened } from 'svelte/motion';
	import { get } from 'svelte/store';

	/**
	 * Only the snippet paraments are accepted.
	 */
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

	// To save configs
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
			start: spring(0, { stiffness: 0.2, damping: 0.35, precision: 0.001 }),
			width: 0,
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
		// Init with default config if local config is null
		if (localStorage.getItem('hcfg')) {
			let localCfg = JSON.parse(localStorage.getItem('hcfg'));
			for (let index = 0; index < Object.keys(others).length; index++) {
				snippets[index].start.set(localCfg[index]);
			}
		} else {
			let initLength = 0;
			let w = document.body.clientWidth;
			for (let i = 0; i < Object.keys(others).length; i++) {
				i === 0 ? (initLength = 0) : (initLength += snippets[i - 1].width / w);
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
			style="left: {starts[i] * 100}%;"
			style:pointer-events={snippet.pointerEvents}
			class:actived={snippet.actived}
			bind:this={snippet.ele}
			bind:clientWidth={snippet.width}
			onpointerdown={(e) => {
				if (e.button !== 0) return;
				e.preventDefault();

				const bodyWidth = document.body.clientWidth; // px
				const gap = e.clientX - starts[i] * bodyWidth; // px
				const eleWidth = snippet.width; // px

				function seek(e2) {
					if (e2.clientX + eleWidth - gap > bodyWidth || e2.clientX - gap < 0) return;
					snippet.pointerEvents = 'none';
					snippet.actived = true;

					// Set position while moving.
					snippet.start.set((e2.clientX - gap) / bodyWidth);
					// Limit it.
					if (starts[i] < 0) snippet.start.set(0);
					if (starts[i] > (bodyWidth - eleWidth) / bodyWidth)
						snippet.start.set((bodyWidth - eleWidth) / bodyWidth);
				}
				window.addEventListener('pointermove', seek);
				// Tie up loose ends while pointerup.
				window.addEventListener(
					'pointerup',
					(e3) => {
						e3.preventDefault();
						snippet.actived = false;
						snippet.pointerEvents = 'auto';
						window.removeEventListener('pointermove', seek);

						const duration = 0.5;
						for (let j = 0; j < starts.length; j++) {
							if (j === i) continue;
							const st = get(snippet.start);
							const st2 = get(snippets[j].start);

							const midLine = st * bodyWidth + snippet.width / 2;
							const midLine2 = st2 * bodyWidth + snippets[j].width / 2;

							if (
								st * bodyWidth < st2 * bodyWidth + snippets[j].width &&
								st * bodyWidth + snippet.width > st2 * bodyWidth
							) {
								if (midLine >= midLine2) {
									// move left
									snippets[j].start.set(st - snippets[j].width / bodyWidth, { soft: duration });
								} else {
									// move right
									snippets[j].start.set(st + snippet.width / bodyWidth, { soft: duration });
								}
							}
							console.log(get(snippets[j].start));
						}
						setTimeout(() => {
							saveCfg();
						}, duration * 1001);
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
