<script>
	import { onMount } from 'svelte';
	import { quadOut } from 'svelte/easing';
	import { spring, Tween, tweened } from 'svelte/motion';
	import { get } from 'svelte/store';

	/**
	 * Only the snippet paraments are accepted.
	 */
	let { children, ...others } = $props();

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
			start: new Tween(0, { duration: 200, easing: quadOut }),
			width: 0,
			pointerEvents: 'auto',
			actived: false
		};
	});

	/**
	 * Auto adjust layout base on a specify snippet.
	 * @param {number} baseLine - Indicate the node's left position, in Percentage.
	 * @param {number} bodyWidth - The <body> width.
	 * @param {Snippet} snippet - The snippet object.
	 */
	function autoAdjust(baseLine, bodyWidth, snippet) {
		let onTheLeft = Array();
		let onTheRight = Array();
		const eleWidth = snippet.width;

		let st = baseLine;
		if (st < 0) st = 0;
		if (st > (bodyWidth - eleWidth) / bodyWidth) st = (bodyWidth - eleWidth) / bodyWidth;
		const midLine = st * bodyWidth + snippet.width / 2;

		// Divide snippets to the right and left of current snippet.
		for (let j = 0; j < numOfSnippets; j++) {
			if (snippets[j] === snippet) continue;

			const st2 = snippets[j].start.current;

			const midLine2 = st2 * bodyWidth + snippets[j].width / 2;

			midLine >= midLine2 ? onTheLeft.push(snippets[j]) : onTheRight.push(snippets[j]);
		}
		onTheLeft.sort((a, b) => a.start.current - b.start.current);
		onTheRight.sort((a, b) => b.start.current - a.start.current);

		// Find the blocks that needs to be moved left or right.
		let leftStart = st; // In Percentage.
		let leftest;
		for (let i = onTheLeft.length - 1; i >= 0; i--) {
			const end = onTheLeft[i].start.current + onTheLeft[i].width / bodyWidth;
			if (end >= leftStart) {
				leftStart -= onTheLeft[i].width / bodyWidth;
				leftest = i;
			} else break;
		}
		let rightEnd = st + snippet.width / bodyWidth; // In Percentage.
		let rightest;
		for (let i = onTheRight.length - 1; i >= 0; i--) {
			const start = onTheRight[i].start.current;
			if (start <= rightEnd) {
				rightEnd += onTheRight[i].width / bodyWidth;
				rightest = i;
			} else break;
		}

		// Move block and handle out-of-bounds scenes.
		// case 1. Not out of bound.
		if (leftStart >= 0 && rightEnd <= 1) {
			// If not null
			if (leftest < onTheLeft.length) {
				onTheLeft.push(snippet);
				for (let i = leftest; i < onTheLeft.length; i++) {
					onTheLeft[i].start.target = leftStart;
					leftStart += onTheLeft[i].width / bodyWidth;
				}
			}
			if (rightest < onTheRight.length) {
				onTheRight.push(snippet);
				for (let i = rightest; i < onTheRight.length; i++) {
					onTheRight[i].start.target = rightEnd - onTheRight[i].width / bodyWidth;
					rightEnd -= onTheRight[i].width / bodyWidth;
				}
			}
		}
		// case 2. Out of right bound.
		else if (leftStart >= 0 && rightEnd > 1) {
			const rightGap = rightEnd - 1;
			rightEnd = 1;
			if (rightest < onTheRight.length) {
				onTheRight.push(snippet);
				for (let i = rightest; i < onTheRight.length; i++) {
					onTheRight[i].start.target = rightEnd - onTheRight[i].width / bodyWidth;
					rightEnd -= onTheRight[i].width / bodyWidth;
				}
			}
			leftStart -= rightGap;
			if (leftest < onTheLeft.length) {
				onTheLeft.push(snippet);
				for (let i = leftest; i < onTheLeft.length; i++) {
					onTheLeft[i].start.target = leftStart;
					leftStart += onTheLeft[i].width / bodyWidth;
				}
			}
		}
		// case 3. Out of left bound or both bounds.
		else {
			const leftGap = 0 - leftStart;
			leftStart = 0;
			if (leftest < onTheLeft.length) {
				onTheLeft.push(snippet);
				for (let i = leftest; i < onTheLeft.length; i++) {
					onTheLeft[i].start.target = leftStart;
					leftStart += onTheLeft[i].width / bodyWidth;
				}
			}
			rightEnd += leftGap;
			if (rightest < onTheRight.length) {
				for (let i = rightest; i < onTheRight.length; i++) {
					onTheRight[i].start.target = rightEnd - onTheRight[i].width / bodyWidth;
					rightEnd -= onTheRight[i].width / bodyWidth;
				}
			}
		}
	}
	onMount(() => {
		// Init with default config if local config is null
		let isJson = true;
		try {
			Array.isArray(JSON.parse(localStorage.hcfg));
		} catch {
			isJson = false;
		}
		if (
			localStorage.hcfg &&
			isJson &&
			JSON.parse(localStorage.hcfg).every(
				(item) => typeof item === 'number' && 0 <= item && item <= 1
			)
		) {
			let localCfg = JSON.parse(localStorage.hcfg);
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
	});

	let timer;
</script>

<svelte:window
	onresize={() => {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			const bodyWidth = document.body.clientWidth;
			let copy = snippets.map((s) => s).sort((a, b) => a.start.current - b.start.current);
			for (let i = 0; i < copy.length; i++) {
				if (i % 2 === 0 || i === copy.length - 1) {
					const baseLine = copy[i].start.current;
					autoAdjust(baseLine, bodyWidth, copy[i]);
				}
			}
			saveCfg();
		}, 501);
	}}
/>

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

						let b = (e3.clientX - gap) / bodyWidth;
						autoAdjust(b, bodyWidth, snippet);
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
