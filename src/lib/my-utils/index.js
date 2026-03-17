import { resolve } from '$app/paths';

export { setShortCut } from './svelte-hooks';
export { walkDir } from './server-side';

/**
 *
 * @param {string} url
 * @returns
 */
export function formatUrl(url, ...args) {
	if (!url || typeof url !== 'string') {
		throw new Error('Invalid URL string');
	}

	let resultUrl = url.replaceAll(/\\/g, '/').replaceAll(/\/+/g, '/').replace(/\/$/, '');

	if (url.startsWith('https://') || url.startsWith('http://')) {
		resultUrl = new URL(resultUrl).href;
	} else{
		resultUrl = `/${resultUrl}`;
	}

	let res = resolve(resultUrl, ...args);

	return res;
}

export async function copyToClipboard(text) {
	if (navigator.clipboard) {
		// 使用现代 Clipboard API
		try {
			await navigator.clipboard.writeText(text);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	} else {
		// 降级到传统方法（避免自动滚动页面）
		const textArea = document.createElement('textarea');
		textArea.value = text;
		textArea.style.position = 'fixed';
		textArea.style.left = '-9999px';
		textArea.style.top = '0';
		textArea.style.opacity = '0';
		textArea.style.pointerEvents = 'none';

		const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		document.body.appendChild(textArea);
		textArea.focus({ preventScroll: true });
		textArea.select();

		try {
			document.execCommand('copy');
		} catch (err) {
			console.error('Failed to copy text: ', err);
		} finally {
			document.body.removeChild(textArea);
			if (previousActive) previousActive.focus({ preventScroll: true });
		}
	}
}
