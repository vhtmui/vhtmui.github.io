export { setShortCut } from './svelte-hooks';
export { walkDir } from './server-side';

export function formatUrl(url) {
	if (!url || typeof url !== 'string') {
		return '/';
	}

	try {
		// 如果有协议，验证是否为有效 URL
		if (url.match(/^https?:\/\//)) {
			new URL(url);
		}
	} catch (e) {
		console.warn('Invalid URL:', url);
		return '/';
	}

	// 校验相对url
	let normalized = url.replace(/\\/g, '/');
	normalized = normalized.replace(/^https?:\/\//, '').replace(/^\/\//, '');
	normalized = normalized.replace(/^[^/]*\//, '/');
	normalized = normalized.replace(/\/+/g, '/');

	if (!normalized.startsWith('/')) {
		normalized = '/' + normalized;
	}

	return normalized || '/';
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
		// 降级到传统方法
		const textArea = document.createElement('textarea');
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			document.execCommand('copy');
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
		document.body.removeChild(textArea);
	}
}