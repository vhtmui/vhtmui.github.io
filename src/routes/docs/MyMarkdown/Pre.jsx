import { useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@lib/utils.js';
import CsButton from '@my/CsButton.jsx';
import { copyToClipboard } from '@lib/my-utils.js';

/** 对应原项目 src/routes/docs/MyMarkdown/Pre.svelte（代码块 + 复制按钮） */
export default function Pre({ node, className, children, ...rest }) {
	const [copied, setCopied] = useState(false);
	const preRef = useRef(null);

	async function handleClick() {
		if (copied) return;
		const codeText = preRef.current.textContent;
		await copyToClipboard(codeText);
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 2000);
	}

	return (
		<div className="relative md-pre-wrapper">
			<pre ref={preRef} contentEditable="false" className={cn('border-2', className)} {...rest}>
				{children}
			</pre>
			<CsButton
				size="icon"
				variant="outline"
				className="local-btn absolute top-2 right-2"
				disabled={copied}
				onClick={handleClick}
			>
				{copied ? <Check /> : <Copy />}
			</CsButton>
		</div>
	);
}
