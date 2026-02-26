<script>
	import * as InputGroup from '$lib/components/ui/input-group';
	import { Separator } from '@ui/separator';
	import CopyText from '$lib/components/my/CopyText.svelte';
	import { setShortCut } from '$lib/my-utils';

	/** @type {HTMLInputElement} */
	let inputRef = null;
	let macAddress = $state('');

	const delay = 750;
	const macExp = [
		{ name: 'Hyphen-Hex', nums: 2, symbol: '-' },
		{ name: 'Colon-Hex', nums: 2, symbol: ':' },
		{ name: 'CiscoLike-Hyphen-Hex', nums: 4, symbol: '-' },
		{ name: 'CiscoLike-Colon-Hex', nums: 4, symbol: ':' }
	];

	function cleanMac() {
		return macAddress.replace(/[^A-Fa-f0-9]/g, '').toUpperCase();
	}

	/**
	 * @param {string} macAddr - MAC Address
	 * @param {number} eachCounts - Nums of each mac group
	 * @param {string} separator - Separator between each mac group
	 */
	function macFormatter(macAddr, eachCounts, separator) {
		macAddr = macAddr
			.replace(/[^A-Fa-f0-9]/g, '')
			.slice(0, 12)
			.toUpperCase();

		let output = String();

		for (let i = 0; i < macAddr.length; i += 1) {
			output += macAddr[i];
			if (i % eachCounts === eachCounts - 1 && i !== macAddr.length - 1) {
				output += separator;
			}
		}

		return output;
	}

	$effect(() => {
		setShortCut('ctrl+k', () => {
			inputRef.select();
		});
	});
</script>

<div class="mac-converter">
	<h1>Mac Address Converter</h1>
	<InputGroup.Root class="max-w-70">
		<InputGroup.Input
			bind:ref={inputRef}
			placeholder="CTRL K"
			bind:value={
				cleanMac,
				(v) => {
					macAddress = v;
				}
			}
		/>
		<InputGroup.Addon align="inline-end">len: {cleanMac().length}</InputGroup.Addon>
	</InputGroup.Root>
	{#if cleanMac().length}
		<ul>
			{#each macExp as { name, nums, symbol }, i}
				<li>
					<CopyText text={macFormatter(cleanMac(), nums, symbol)} {delay} />
				</li>
				{#if i < macExp.length - 1}
					<Separator />
				{/if}
			{/each}
		</ul>
	{/if}
</div>

<style>
	div.mac-converter {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: calc(10 * 0.25rem);
		padding: 10vw;
		min-height: 100%;
	}
	h1 {
		text-align: center;
	}
	ul {
		width: 90%;
		max-width: calc(64 * 0.25rem);
		display: flex;
		flex-direction: column;
		gap: calc(2 * 0.25rem);
	}
</style>
