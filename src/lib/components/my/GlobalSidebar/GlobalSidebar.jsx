import { useState } from 'react';
import { Folder, FolderOpen } from 'lucide-react';
import * as Sidebar from '@ui/sidebar.jsx';
import { useSidebar } from '@ui/sidebar.jsx';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@ui/collapsible.jsx';
import { useSb } from './context.js';
import CsSidebarTrigger from './CsSidebarTrigger.jsx';

/**
 * 递归渲染菜单项，对应原项目 GlobalSidebar.svelte 中的 mitem snippet。
 */
function MenuItemView({ menuItem }) {
	const [open, setOpen] = useState(menuItem.open);
	const isDir = menuItem.children.length > 0;
	const Icon = menuItem.Icon;

	if (isDir) {
		return (
			<Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
				<Sidebar.MenuItem>
					<CollapsibleTrigger asChild>
						<Sidebar.MenuButton className="w-full cursor-pointer">
							{Icon ? (open ? <FolderOpen className="size-4" /> : <Folder className="size-4" />) : null}
							<span>{menuItem.label}</span>
						</Sidebar.MenuButton>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<Sidebar.MenuSub>
							{menuItem.children.map((child) => (
								<MenuItemView key={child.href} menuItem={child} />
							))}
						</Sidebar.MenuSub>
					</CollapsibleContent>
				</Sidebar.MenuItem>
			</Collapsible>
		);
	}

	return (
		<Sidebar.MenuItem>
			<Sidebar.MenuButton asChild>
				<a href={menuItem.href}>
					{Icon ? <Icon className="size-4" /> : null}
					<span>{menuItem.label}</span>
				</a>
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	);
}

/** 对应原项目 src/lib/components/my/GlobalSidebar/GlobalSidebar.svelte */
export default function GlobalSidebar({ top = 0 }) {
	const { itemData } = useSb();
	const sidebar = useSidebar();
	const root = itemData?.get('root');

	return (
		<Sidebar.Root style={{ top: `${top}px` }}>
			<CsSidebarTrigger
				className="absolute top-[calc(50vh-32px)] right-1 h-16 w-6 rounded-md transition-none"
				hidden={!sidebar.open}
			/>
			<CsSidebarTrigger
				className="absolute top-[calc(50vh-32px)] -right-7 h-16 w-6 rotate-180 rounded-md transition-none"
				hidden={sidebar.open}
			/>
			{itemData && root ? (
				<Sidebar.Content className="p-2">
					<Sidebar.Menu>
						<MenuItemView menuItem={root} />
					</Sidebar.Menu>
				</Sidebar.Content>
			) : null}
		</Sidebar.Root>
	);
}
