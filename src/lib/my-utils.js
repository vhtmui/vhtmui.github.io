import { useEffect } from 'react';

/**
 * 部署目标：'github' | 'internal' | ''（默认）。
 * 由 vite.config.js 中的 define 在构建时注入。
 */
export function getDeployTarget() {
	return typeof __DEPLOY_TARGET__ === 'string' ? __DEPLOY_TARGET__ : '';
}

/**
 * 站点 base path（GitHub Pages 等场景），构建时由 BASE_PATH 环境变量注入。
 */
export function getBasePath() {
	return typeof __BASE_PATH__ === 'string' ? __BASE_PATH__ : '';
}

/**
 * 把内部路径格式化为带 base 的完整链接。
 * 与原 SvelteKit 版本 $app/paths 的 resolve 行为保持一致。
 */
export function formatUrl(url, ...args) {
	if (!url || typeof url !== 'string') {
		throw new Error('Invalid URL string');
	}

	let resultUrl = url.replaceAll(/\\/g, '/').replaceAll(/\/+/g, '/').replace(/\/$/, '');

	if (url.startsWith('https://') || url.startsWith('http://')) {
		resultUrl = new URL(resultUrl).href;
	} else {
		resultUrl = `/${resultUrl}`;
	}

	return getBasePath() + resultUrl;
}

/**
 * 去掉 pathname 中的 base 前缀，得到路由路径（供 TanStack Router 使用）。
 */
export function stripBase(pathname) {
	const base = getBasePath();
	if (base && pathname.startsWith(base)) {
		return pathname.slice(base.length) || '/';
	}
	return pathname;
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

		const previousActive =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
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

/**
 * 判断某个 docs 相对路径在当前部署目标下是否应该被包含。
 *
 * @param {string} relativePath - 文件路径，以docs为起始目录的路径，例如：docs/blogs/xxx.md
 * @returns {boolean} - 是否应该包含该路径
 */
export function shouldAccessedDoc(relativePath) {
	const deployTarget = getDeployTarget();
	const normalizedPath = String(relativePath || '')
		.replace(/\\/g, '/')
		.replace(/^\.?\//, '');
	const subPath = normalizedPath.slice(5);

	if (deployTarget === 'github') {
		return !subPath.startsWith('未整理的部分');
	}

	if (deployTarget === 'internal') {
		return !subPath.startsWith('未整理的部分') && !subPath.startsWith('blogs');
	}

	return true;
}

/**
 * 注册快捷键，例如 'ctrl+k'。
 * 对应原项目 my-utils 中的 setShortCut。
 */
export function useShortcut(shortcut, handler) {
	useEffect(() => {
		shortcut = shortcut.toLowerCase();
		if (shortcut.split('+').length !== 2)
			throw new Error("Invalid shortcut format. Please use 'modifier+key'.");

		/** @param {KeyboardEvent} event */
		function handleKeyDown(event) {
			const [modifier, key] = shortcut.split('+');

			const isModifierPressed =
				(modifier === 'ctrl' && event.ctrlKey) ||
				(modifier === 'alt' && event.altKey) ||
				(modifier === 'shift' && event.shiftKey) ||
				(modifier === 'meta' && event.metaKey); // Meta 对应 Cmd 键（Mac）

			const isTargetKeyPressed = event.key.toLowerCase() === key;

			if (isModifierPressed && isTargetKeyPressed) {
				event.preventDefault();
				handler();
			}
		}

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [shortcut, handler]);
}
