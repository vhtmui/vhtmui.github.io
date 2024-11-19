<script>
	import { onMount } from 'svelte';
	import { quadOut } from 'svelte/easing';
	import { spring, tweened } from 'svelte/motion';
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
	 * @type {Array<number>} - An array subscribe the `snippets.start`.
	 */
	let starts = $state(Array(Object.keys(others).length));

	/**
	 * To save configs
	 * */
	function saveCfg(timeOut = 501) {
		setTimeout(() => {
			cfg = snippets.map((sn) => {
				return get(sn.start);
			});
			localStorage.setItem('hcfg', JSON.stringify(cfg));
		}, timeOut);
	}

	// Build `snippets` data structure
	snippets = fns.map((fn) => {
		return {
			fn: fn,
			ele: null,
			start: spring(0, { stiffness: 0.2, damping: 0.6, precision: 0.001 }),
			width: 0,
			pointerEvents: 'auto',
			actived: false
		};
	});

	// Subscription.
	for (let i = 0; i < starts.length; i++) {
		snippets[i].start.subscribe((value) => {
			starts[i] = value;
		});
	}

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

		// Divide right and left.
		for (let j = 0; j < starts.length; j++) {
			if (snippets[j] === snippet) continue;

			const st2 = get(snippets[j].start);

			const midLine2 = st2 * bodyWidth + snippets[j].width / 2;

			midLine >= midLine2 ? onTheLeft.push(snippets[j]) : onTheRight.push(snippets[j]);
		}
		onTheLeft.sort((a, b) => get(a.start) - get(b.start));
		onTheRight.sort((a, b) => get(b.start) - get(a.start));

		// Find the blocks that needs to be moved left or right.
		let leftStart = st; // In Percentage.
		let leftest;
		for (let i = onTheLeft.length - 1; i >= 0; i--) {
			const end = get(onTheLeft[i].start) + onTheLeft[i].width / bodyWidth;
			if (end >= leftStart) {
				leftStart -= onTheLeft[i].width / bodyWidth;
				leftest = i;
			} else break;
		}
		let rightEnd = st + snippet.width / bodyWidth; // In Percentage.
		let rightest;
		for (let i = onTheRight.length - 1; i >= 0; i--) {
			const start = get(onTheRight[i].start);
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
					onTheLeft[i].start.set(leftStart);
					leftStart += onTheLeft[i].width / bodyWidth;
				}
			}
			if (rightest < onTheRight.length) {
				onTheRight.push(snippet);
				for (let i = rightest; i < onTheRight.length; i++) {
					onTheRight[i].start.set(rightEnd - onTheRight[i].width / bodyWidth);
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
					onTheRight[i].start.set(rightEnd - onTheRight[i].width / bodyWidth);
					rightEnd -= onTheRight[i].width / bodyWidth;
				}
			}
			leftStart -= rightGap;
			if (leftest < onTheLeft.length) {
				onTheLeft.push(snippet);
				for (let i = leftest; i < onTheLeft.length; i++) {
					onTheLeft[i].start.set(leftStart);
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
					onTheLeft[i].start.set(leftStart);
					leftStart += onTheLeft[i].width / bodyWidth;
				}
			}
			rightEnd += leftGap;
			if (rightest < onTheRight.length) {
				for (let i = rightest; i < onTheRight.length; i++) {
					onTheRight[i].start.set(rightEnd - onTheRight[i].width / bodyWidth);
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
			JSON.parse(localStorage.hcfg).every((item) => 0 <= item && item <= 1)
		) {
			let localCfg = JSON.parse(localStorage.hcfg);
			for (let index = 0; index < Object.keys(others).length; index++) {
				snippets[index].start.set(localCfg[index]);
			}
		} else {
			console.log('enter');
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

<svelte:window
	onresize={() => {
		const bodyWidth = document.body.clientWidth;
		snippets.forEach((snippet) => {
			const base = get(snippet.start);
			autoAdjust(base, bodyWidth, snippet);
		});
	}}
/>

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

				// Save config after motion end.
				const duration = 0.5;
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
						saveCfg(duration * 1001);
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
	div#rootHead {
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
