<script module>
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
	 * @param {string} nameToRoot 根节点路径
	 * @returns {Map<string, GlobalSidebarMenuItem>} 菜单项
	 */
	export function createSidebarMenuItems(itemProps, nameToRoot) {
		let items = new Map();
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

		return items;
	}

	/**
	 * 菜单项数据
	 * @type {Object}
	 * @property {Map<string, GlobalSidebarMenuItem>} data 菜单项数据
	 */
	export const sbNode = $state({
		data: null,
		option: {
			header: null,
			footer: null
		}
	});
</script>

<script>
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';

	let menuItems = createSidebarMenuItems(
		[new GlobalSidebarMenuItem('root', 'init...', '/', null)],
		'root'
	);
	sbNode.data = menuItems;
</script>

{#snippet mitem(/** @type {GlobalSidebarMenuItem} */ menuItem)}
	{#if menuItem.children.length > 0}
		<Collapsible.Root open class="group/collapsible">
			<Sidebar.MenuItem>
				<Collapsible.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton {...props}>
							{#snippet child({ props })}
								<a href={menuItem.href} {...props}>
									{#if menuItem.icon}
										<menuItem.icon />
									{/if}
									<span>{menuItem.label}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
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
		<Sidebar.MenuItem>
			<Sidebar.MenuButton>
				{#snippet child({ props })}
					<a href={menuItem.href} {...props}>
						{#if menuItem.icon}
							<menuItem.icon />
						{/if}
						<span>{menuItem.label}</span>
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	{/if}
{/snippet}

<Sidebar.Root>
	{#if sbNode.option?.header}
		<Sidebar.Header>
			{@render sbNode.option.header()}
		</Sidebar.Header>
	{/if}
	<Sidebar.Content class="p-2">
		<Sidebar.Menu>
			{#if sbNode.data && sbNode.data.get('root')}
				{@render mitem(sbNode.data.get('root'))}
			{/if}
		</Sidebar.Menu>
	</Sidebar.Content>
	{#if sbNode.option?.footer}
		<Sidebar.Footer>
			{@render sbNode.option.footer()}
		</Sidebar.Footer>
	{/if}
</Sidebar.Root>
