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
		 * @param {any} icon 图标
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
	 * 从GlobalSidebarMenuItem[] 更新菜单项的children，渲染时将以root为根节点渲染
	 * @param {GlobalSidebarMenuItem[]} itemProps 菜单项
	 * @returns {Map<string, GlobalSidebarMenuItem>} 菜单项
	 */
	export function createSidebarMenuItems(itemProps) {
		let items = new Map();
		itemProps
			.map((item) => {
				item.path = item.path.replaceAll(/\\+/g, '/');
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
		return items;
	}

	/**
	 * @function setSidebarManager
	 * @description 设置侧边栏管理器
	 * @param {Map<string, GlobalSidebarMenuItem>} items 侧边栏菜单项
	 */
	export let sbNode = $state({ data: null });

</script>

<script>
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';

	let menuItems = createSidebarMenuItems([new GlobalSidebarMenuItem('root', 'init...', '/', null)]);
	sbNode.data = menuItems;

	$inspect(sbNode);
</script>

{#snippet mitem(/** @type {GlobalSidebarMenuItem} */ menuItem)}
	{#if menuItem.children.length > 0}
		<Collapsible.Root open class="group/collapsible">
			<Sidebar.MenuItem>
				<Collapsible.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton {...props}>{menuItem.label}</Sidebar.MenuButton>
					{/snippet}
				</Collapsible.Trigger>
				<Collapsible.Content>
					<Sidebar.MenuSub>
						{#each menuItem.children as child}
							{@render mitem(child)}
						{/each}
					</Sidebar.MenuSub>
				</Collapsible.Content>
			</Sidebar.MenuItem>
		</Collapsible.Root>
	{:else}
		<Sidebar.MenuSub>
			<Sidebar.MenuItem>{menuItem.label}</Sidebar.MenuItem>
		</Sidebar.MenuSub>
	{/if}
{/snippet}

<Sidebar.Root>
	<Sidebar.Menu>
		{#if sbNode.data}
			{@render mitem(sbNode.data?.get('root'))}
		{/if}
	</Sidebar.Menu>
</Sidebar.Root>
