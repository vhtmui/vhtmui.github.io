import { SvelteMap } from 'svelte/reactivity';

/**
 * 菜单项数据
 * @type {Object}
 * @property {Map<string, GlobalSidebarMenuItem>} data 菜单项数据
 * @property {Object} option 选项
 */
export const sb = $state({
	itemData: null,
	option: {
		header: null,
		footer: null
	}
});

/**
 * 侧边栏菜单项，基于路径渲染
 */
export class GlobalSidebarMenuItem {
	/**
	 * @param {string} path 路径
	 * @param {string} label 显示名称
	 * @param {string} href 点击指向的链接
	 * @param {any} icon 图标
	 * @param {boolean} open 是否展开
	 * @param {boolean} highlight 是否高亮
	 */
	constructor(path, label, href, icon = null, open = true, highlight = false) {
		this.path = path;
		this.label = label;
		this.href = href;
		this.Icon = $state(icon);
		this.open = $state(open);
		this.highlight = highlight;
		this.children = [];
	}
}

/**
 * 从GlobalSidebarMenuItem[] 更新菜单项的children，渲染时将以root为根节点渲染
 * @param {GlobalSidebarMenuItem[]} itemProps 菜单项
 * @param {string} nameToRoot 根节点路径
 */
export function setSidebarMenuItems(itemProps, nameToRoot) {
	let items = new SvelteMap();
	itemProps
		.map((item) => {
			item.path = item.path.replaceAll(/\\+/g, '/');
			if (item.path.startsWith('/')) {
				item.path = item.path.slice(1);
			}
			if (!item.href.startsWith('/')) {
				item.href = '/' + item.href;
			}
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
}
