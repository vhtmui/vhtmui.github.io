import { useRef, useState } from 'react';
import * as InputGroup from '@ui/input-group.jsx';
import { Separator } from '@ui/separator.jsx';
import CopyText from '@my/CopyText.jsx';
import { useShortcut } from '@lib/my-utils.js';

/** 对应原项目 src/routes/mac-converter/+page.svelte */
const delay = 750;
const macExp = [
	{ name: 'Hyphen-Hex', nums: 2, symbol: '-' },
	{ name: 'Colon-Hex', nums: 2, symbol: ':' },
	{ name: 'CiscoLike-Hyphen-Hex', nums: 4, symbol: '-' },
	{ name: 'CiscoLike-Colon-Hex', nums: 4, symbol: ':' }
];

function cleanMac(macAddress) {
	return macAddress.replace(/[^A-Fa-f0-9]/g, '').toUpperCase();
}

/**
 * @param {string} macAddr - MAC Address
 * @param {number} eachCounts - Nums of each mac group
 * @param {string} separator - Separator between each mac group
 */
function macFormatter(macAddr, eachCounts, separator) {
	macAddr = macAddr.replace(/[^A-Fa-f0-9]/g, '').slice(0, 12).toUpperCase();

	let output = String();

	for (let i = 0; i < macAddr.length; i += 1) {
		output += macAddr[i];
		if (i % eachCounts === eachCounts - 1 && i !== macAddr.length - 1) {
			output += separator;
		}
	}

	return output;
}

export default function MacConverter() {
	const inputRef = useRef(null);
	const [macAddress, setMacAddress] = useState('');

	useShortcut('ctrl+k', () => {
		inputRef.current?.select();
	});

	const cleaned = cleanMac(macAddress);

	return (
		<div className="mac-converter">
			<h1>Mac Address Converter</h1>
			<InputGroup.Root className="max-w-70">
				<InputGroup.Input
					ref={inputRef}
					placeholder="CTRL K"
					value={cleaned}
					onChange={(e) => setMacAddress(e.target.value)}
				/>
				<InputGroup.Addon align="inline-end">len: {cleaned.length}</InputGroup.Addon>
			</InputGroup.Root>
			{cleaned.length ? (
				<ul>
					{macExp.map(({ name, nums, symbol }, i) => (
						<li key={i}>
							<CopyText textContent={macFormatter(cleaned, nums, symbol)} delay={delay} />
							{i < macExp.length - 1 && <Separator />}
						</li>
					))}
				</ul>
			) : null}
			<style>{`
				div.mac-converter {
					width: 100%;
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: calc(10 * 0.25rem);
					padding: 5vw 10vw;
					min-height: 100%;
				}
				div.mac-converter h1 {
					text-align: center;
					padding-top: 10vh;
				}
				div.mac-converter ul {
					width: 90%;
					max-width: calc(64 * 0.25rem);
					display: flex;
					flex-direction: column;
					gap: calc(2 * 0.25rem);
				}
			`}</style>
		</div>
	);
}
