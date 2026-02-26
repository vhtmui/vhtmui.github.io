<script module>
	import { setContext } from 'svelte';
	/**
	 * 侧边栏菜单项，基于路径渲染
	 *
	 * @abstract sadfsdfsf
	 */
	export class GlobalSidebarMenuItem {
		static a = 1;
		b = 2;
		/**
		 * @param {string} path 路径
		 * @param {string} label 显示名称
		 * @param {string} href 点击指向的链接
		 * @param {string} icon 图标
		 * @param {boolean} open 是否展开
		 * @param {boolean} highlight 是否高亮
		 */
		constructor(path, label, href, icon, open = false, highlight) {
			this.path = path;
			this.label = label;
			this.href = href;
			this.icon = icon;
			this.open = open;
			this.highlight = highlight;
		}
	}

	class GlobalSidebarManager {
		items = new Map();
		/**
		 * @description 侧边栏菜单
		 *
		 * @param {GlobalSidebarMenuItem[]} sbMenuItems 菜单项
		 */
		constructor(sbMenuItems) {
			sbMenuItems.forEach((item) => {
				this.items.set(item.path, item);
			});
		}
	}

	/**
	 * @function setSidebarManager
	 * @description 设置侧边栏管理器
	 * @param {GlobalSidebarManager} manager 侧边栏管理器
	 */
	export function setSidebarManager(manager) {
		setContext('sidebar', manager);
	}
</script>

<script>
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { House } from '@lucide/svelte';
</script>

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
