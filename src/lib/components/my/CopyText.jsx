import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import CsButton from './CsButton.jsx';
import { copyToClipboard } from '@lib/my-utils.js';

/** 对应原项目 src/lib/components/my/CopyText.svelte */
export default function CopyText({ textContent, delay = 0, className }) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		if (copied) return;
		await copyToClipboard(textContent);
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, delay);
	}

	return (
		<div className={'flex items-center align-middle ' + (className ?? '')}>
			<span className="mr-auto">{textContent}</span>
			<CsButton className="ml-1" onClick={handleCopy} disabled={copied || textContent.length === 0}>
				{copied ? <Check /> : <Copy />}
			</CsButton>
		</div>
	);
}
