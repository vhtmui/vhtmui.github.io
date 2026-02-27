<script module>
	import { setContext, getContext } from 'svelte';
	const GSBCONTEXT = Symbol('GSB');

	/**
	 * 侧边栏菜单项，基于路径渲染
	 */
	export class GlobalSidebarMenuItem {
		/**
		 * @param {string} path 路径
		 * @param {string} label 显示名称
		 * @param {string} href 点击指向的链接
		 * @param {string} icon 图标
		 * @param {boolean} open 是否展开
		 * @param {boolean} highlight 是否高亮
		 */
		constructor(path, label, href, icon = null, open = false, highlight = false) {
			this.path = path;
			this.label = label;
			this.href = href;
			this.icon = icon;
			this.open = open;
			this.highlight = highlight;
			this.children = [];
		}
	}

	/**
	 * @description 创建菜单项
	 * @param {GlobalSidebarMenuItem[]} itemProps 菜单项
	 * @returns {Map<string, GlobalSidebarMenuItem>} 菜单项
	 */
	function createSidebarMenuItems(itemProps) {
		let items = new Map();
		itemProps.forEach((item) => {
			items.set(item.path, item);
			let parentPath = item.path.split('/').slice(0, -1).join('/');
			if (parentPath && items.has(parentPath)) {
				let parent = items.get(parentPath);
				parent.children.push(item);
			}
		});
		return items;
	}

	/**
	 * @function setSidebarManager
	 * @description 设置侧边栏管理器
	 * @param {GlobalSidebarMenuItem[]} itemProps 侧边栏菜单项
	 */
	export function setSidebarManager(itemProps) {
		setContext(GSBCONTEXT, createSidebarMenuItems(itemProps));
	}

	export function getSidebarManager() {
		return getContext(GSBCONTEXT);
	}
</script>

<script>
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';

	const menuItems = getSidebarManager();
</script>

{#snippet mitem()}
	<Collapsible.Root open class="group/collapsible">
		<Sidebar.MenuItem>
			<Collapsible.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton {...props} />
				{/snippet}
			</Collapsible.Trigger>
			<Collapsible.Content>
				<Sidebar.MenuSub>
					<Sidebar.MenuSubItem />
				</Sidebar.MenuSub>
			</Collapsible.Content>
		</Sidebar.MenuItem>
	</Collapsible.Root>
{/snippet}

<Sidebar.Root>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>aaa</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
