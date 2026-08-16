import { useSyncExternalStore } from 'react';
import { formatUrl } from '@lib/my-utils.js';

/**
 * 全局侧边栏状态，对应原项目 src/lib/components/my/GlobalSidebar/context.svelte.js
 */
export const sb = {
	itemData: null,
	option: {
		header: null,
		footer: null
	}
};

let version = 0;
let snapshot = { itemData: sb.itemData, option: sb.option, version: 0 };
const listeners = new Set();

function emit() {
	version++;
	snapshot = { itemData: sb.itemData, option: sb.option, version };
	listeners.forEach((l) => l());
}

function subscribe(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSnapshot() {
	return snapshot;
}

/** React 订阅钩子 */
export function useSb() {
	return useSyncExternalStore(subscribe, getSnapshot);
}

/**
 * 侧边栏菜单项，基于路径渲染。
 */
export class GlobalSidebarMenuItem {
	/**
	 * @param {string} path 树结构路径
	 * @param {string} label 显示名称
	 * @param {string} href <a>标签的href属性
	 * @param {any} icon 图标组件
	 * @param {boolean} open 是否展开
	 * @param {boolean} highlight 是否高亮
	 */
	constructor(path, label, href, icon = null, open = true, highlight = false) {
		this.path = path;
		this.label = label;
		this.href = href;
		this.Icon = icon;
		this.open = open;
		this.highlight = highlight;
		this.children = [];
	}
}

/**
 * 从 GlobalSidebarMenuItem[] 更新菜单项的 children，构建 Map 结构设置 sb.itemData。
 * 生成的 Map 结构为：path => GlobalSidebarMenuItem，渲染时以 root 为根节点。
 */
export function setSidebarMenuItems(itemProps, nameToRoot) {
	const items = new Map();
	itemProps
		.map((item) => {
			item.path = item.path.replaceAll(/\\+/g, '/');
			if (item.path.startsWith('/')) {
				item.path = item.path.slice(1);
			}
			item.href = formatUrl(item.href);
			return item;
		})
		.sort((a, b) => a.path.split('/').length - b.path.split('/').length)
		.forEach((item) => {
			items.set(item.path, item);
			let parentPath = item.path.split('/').slice(0, -1).join('/');
			if (parentPath && items.has(parentPath)) {
				let parent = items.get(parentPath);
				parent.children.push(item);
			}
		});

	if (items.has(nameToRoot)) {
		const root = items.get(nameToRoot);
		items.delete(nameToRoot);
		items.set('root', root);
	} else {
		throw new Error(`nameToRoot: ${nameToRoot} not found`);
	}

	sb.itemData = items;
	emit();
}

/** 清空侧边栏菜单（对应原项目 onDestroy 中的 sb.itemData = null） */
export function clearSidebarMenuItems() {
	sb.itemData = null;
	emit();
}
