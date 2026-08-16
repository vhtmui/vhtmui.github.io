import { useSyncExternalStore } from 'react';

/**
 * 主题模块：复刻 mode-watcher 的行为（localStorage key 一致），
 * 通过 html 元素上的 .dark 类 + data-theme 属性切换主题。
 */
const MODE_KEY = 'mode-watcher-mode';
const THEME_KEY = 'mode-watcher-theme';
const MODES = ['dark', 'light', 'system'];

function readStoredMode() {
	const v = localStorage.getItem(MODE_KEY);
	return MODES.includes(v) ? v : 'system';
}

function readStoredTheme() {
	const v = localStorage.getItem(THEME_KEY);
	return v === null || v === undefined ? '' : v;
}

let userMode = typeof localStorage !== 'undefined' ? readStoredMode() : 'system';
let theme = typeof localStorage !== 'undefined' ? readStoredTheme() : '';

let snapshot = { mode: userMode, theme, derived: undefined };
const listeners = new Set();

function getDerived() {
	if (typeof window === 'undefined') return undefined;
	if (userMode === 'system') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return userMode;
}

function apply() {
	const d = getDerived();
	const rootEl = document.documentElement;
	if (d === 'light') {
		rootEl.classList.remove('dark');
	} else {
		rootEl.classList.add('dark');
	}
	rootEl.style.colorScheme = d ?? 'light';
	if (theme) {
		rootEl.setAttribute('data-theme', theme);
	} else {
		rootEl.removeAttribute('data-theme');
	}
}

function emit() {
	snapshot = { mode: userMode, theme, derived: getDerived() };
	listeners.forEach((l) => l());
}

function subscribe(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSnapshot() {
	return snapshot;
}

/** 设置模式（'light' | 'dark' | 'system'），持久化到 localStorage */
export function setMode(mode) {
	userMode = mode;
	localStorage.setItem(MODE_KEY, mode);
	emit();
	apply();
}

/** 设置主题（'light' | 'dark'），持久化到 localStorage 并写入 data-theme */
export function setTheme(newTheme) {
	theme = newTheme;
	localStorage.setItem(THEME_KEY, newTheme);
	emit();
	apply();
}

/** 在 light/dark 之间切换（对应 mode-watcher 的 toggleMode + ThemeToggle 逻辑） */
export function toggleTheme() {
	const derived = getDerived();
	const next = derived === 'dark' ? 'light' : 'dark';
	setMode(next);
	setTheme(next);
}

/** 应用启动时初始化：对应 ModeWatcher 与 ThemeToggle 的 onMount */
export function initTheme() {
	setMode(readStoredMode());
	setTheme(getDerived() ?? '');
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		if (userMode === 'system') {
			emit();
			apply();
		}
	});
}

/** 供 React 组件订阅主题状态 */
export function useTheme() {
	return useSyncExternalStore(subscribe, getSnapshot);
}
