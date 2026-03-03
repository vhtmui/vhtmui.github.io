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
