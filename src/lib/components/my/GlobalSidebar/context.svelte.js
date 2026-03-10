import { SvelteMap } from 'svelte/reactivity';
import { formatUrl } from '$lib/my-utils';

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
	 * @param {string} path 树结构路径
	 * @param {string} label 显示名称
	 * @param {string} href <a>标签的href属性
	 * @param {any} icon 图标，响应式渲染
	 * @param {boolean} open 是否展开，绑定到组件的`open` prop
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
 * 从GlobalSidebarMenuItem[] 更新菜单项的children，构建Map结构设置sb.itemData
 * @param {GlobalSidebarMenuItem[]} itemProps 菜单项
 * @param {string} nameToRoot 指定根节点的path，生成的Map中会将其key改为root
 *
 * * 生成的Map结构为：path => GlobalSidebarMenuItem，children为子菜单项数组
 * * path格式为：path/to/file，无前导/尾导斜杠
 * * 渲染时以root为根节点渲染
 */
export function setSidebarMenuItems(itemProps, nameToRoot) {
	let items = new SvelteMap();
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
}
