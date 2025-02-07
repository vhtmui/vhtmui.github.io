<script>
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { quadOut } from 'svelte/easing';
	import { spring, Tween, tweened } from 'svelte/motion';
	import { get } from 'svelte/store';

	/**
	 * Only the snippet paraments are accepted.
	 * @property {guides} - The guide line, as Percentage.
	 */
	let { children, guides = 0.5, ...others } = $props();

	/**
	 * @type {function} - Expect only snippet function.
	 */
	let fns = Object.values(others);
	/**
	 * Used to indicate the state of the snippets and calculate the layout of the snippets
	 * @typedef {Object} Snippet
	 * @property {function} fn - Function passed from caller.
	 * @property {HTMLDivElement} ele - Varriable bind to the <div>.
	 * @property {spring<number>} start - The starting position of the <div> block, expressed as a Percentage.
	 * @property {number} width - Bind to the element's clientLength.
	 * @property {string} pointerEvents - Indicate the `pointer-events` attribute.
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

	/**
	 * The number of snippets .
	 * @type {number}
	 */
	let numOfSnippets = Object.keys(others).length;

	/**
	 * To save configs
	 * */
	function saveCfg(timeOut = 501) {
		setTimeout(() => {
			cfg = snippets.map((sn) => {
				return sn.start.current;
			});
			localStorage.setItem('headcfg', JSON.stringify(cfg));
		}, timeOut);
	}

	// Build `snippets` data structure
	snippets = fns.map((fn) => {
		return {
			fn: fn,
			ele: null,
			start: new Tween(0, { duration: 150, easing: quadOut }),
			width: 0,
			pointerEvents: 'auto',
			actived: false
		};
	});

	/**
	 * Auto adjust layout base on a specify snippet.
	 * @param {number} midLine - Indicate the center line of the header, in Percentage.
	 * @param {number} bodyWidth - The <body> width.
	 * @param {Snippet} snippet - The snippet not to be adjusted.
	 */
	function autoAdjust(midLine, bodyWidth, snippet) {
		let copy = snippets
			.map((s) => s)
			.sort(
				(a, b) =>
					a.start.current * bodyWidth + 0.5 * a.width - b.start.current * bodyWidth - 0.5 * b.width
			);
		const length = copy.reduce((acc, cur) => acc + cur.width, 0);
		const start = (bodyWidth - length) * 0.5;
		const end = bodyWidth - length - start;
		let startLine;

		startLine = start > 0 && end / bodyWidth < 1 ? start : start < 0 ? 0 : bodyWidth - length;

		copy.forEach((s) => {
			if (s !== snippet) {
				s.start.target = startLine / bodyWidth;
			}
			startLine += s.width;
		});
	}
	onMount(() => {
		// Init with default config if local config is null
		let isJson = true;
		try {
			Array.isArray(JSON.parse(localStorage.headcfg));
		} catch {
			isJson = false;
		}
		if (
			localStorage.headcfg &&
			isJson &&
			JSON.parse(localStorage.headcfg).every(
				(item) => typeof item === 'number' && 0 <= item && item <= 1
			)
		) {
			let localCfg = JSON.parse(localStorage.headcfg);
			for (let index = 0; index < Object.keys(others).length; index++) {
				snippets[index].start.target = localCfg[index];
			}
		} else {
			let initLength = 0;
			let w = document.body.clientWidth;
			for (let i = 0; i < Object.keys(others).length; i++) {
				i === 0 ? (initLength = 0) : (initLength += snippets[i - 1].width / w);
				snippets[i].start.target = initLength;
			}
			saveCfg();
		}
		let timer;
		addEventListener('resize', () => {
			if (timer) {
				clearTimeout(timer);
			}
			timer = setTimeout(() => {
				let copy = snippets.map((s) => s).sort((a, b) => a.start.current - b.start.current);
				for (let i = 0; i < copy.length; i++) {
					if (i % 2 === 0 || i === copy.length - 1) {
						autoAdjust(guides, document.body.clientWidth);
					}
				}
				saveCfg();
			}, 501);
		});
	});
	// afterNavigate(() => {
	// 	const a = snippets[1].width;
	// 	console.log('s', a);
	// 	let copy = snippets.map((s) => s).sort((a, b) => a.start.current - b.start.current);
	// 	for (let i = 0; i < copy.length; i++) {
	// 		if (i % 2 === 0 || i === copy.length - 1) {
	// 			autoAdjust(guides, document.body.clientWidth);
	// 		}
	// 	}
	// 	saveCfg();
	// });
	$effect(() => {
		snippets[1].width;
		console.log('s', snippets[1].width);
		// autoAdjust(guides, document.body.clientWidth);
		// saveCfg();
	});
</script>

<div id="rootHead">
	{#each snippets as snippet}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="headItem"
			style="left: {snippet.start.current * 100}%;"
			style:pointer-events={snippet.pointerEvents}
			class:actived={snippet.actived}
			bind:this={snippet.ele}
			bind:clientWidth={snippet.width}
			onpointerdown={(e) => {
				if (e.button !== 0) return;
				e.preventDefault();

				const bodyWidth = document.body.clientWidth; // px
				const gap = e.clientX - snippet.start.current * bodyWidth; // px
				const eleWidth = snippet.width; // px

				function seek(e2) {
					if (e2.clientX + eleWidth - gap > bodyWidth || e2.clientX - gap < 0) return;
					snippet.pointerEvents = 'none';
					snippet.actived = true;

					// Set position while moving.
					snippet.start.target = (e2.clientX - gap) / bodyWidth;
					// Limit it.
					if (snippet.start.target < 0) snippet.start.target = 0;
					if (snippet.start.target > (bodyWidth - eleWidth) / bodyWidth)
						snippet.start.target = (bodyWidth - eleWidth) / bodyWidth;
					autoAdjust(guides, bodyWidth, snippet);
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

						autoAdjust(guides, bodyWidth);
						// Current target's start position in Percentage.
						saveCfg(1001);
					},
					{ once: true }
				);
			}}
			onresize={() => {
				console.log('s');
			}}
		>
			{@render snippet.fn()}
		</div>
	{/each}
</div>

<style>
	div#rootHead :global {
		font-family: Arial, 'Microsoft YaHei', sans-serif, 'Segoe UI';
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 100%;
		--transition: transform ease-out 200ms, opacity ease-out 200ms;
		.headItem {
			transition: var(--transition);
			transform: none;
			opacity: 1;
			position: absolute;
		}
		.actived {
			transition: var(--transition);
			z-index: 99;
			transform: scale(0.92);
			opacity: 0.7;
			border-bottom: 2px solid var(--header-block-movable-color);
		}
	}
</style>
