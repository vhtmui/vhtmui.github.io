<script>
	import { resolve } from '$app/paths';
	import * as Sidebar from '@ui/sidebar/index.js';
	import * as Collapsible from '@ui/collapsible/index.js';
	import { sb } from './context.svelte.js';
	import { useSidebar } from '@ui/sidebar/context.svelte.js';
	import CsSidebarTrigger from './CsSidebarTrigger.svelte';

	let { ref = $bindable(null), top } = $props();

	const sidebar = useSidebar();
</script>

{#snippet mitem(/** @type {import('./context.svelte.js').GlobalSidebarMenuItem} */ menuItem)}
	{#if menuItem.children.length > 0}
		<Collapsible.Root bind:open={menuItem.open} class="group/collapsible">
			<Sidebar.MenuItem>
				<Collapsible.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton {...props}>
							{#if menuItem.Icon}
								<menuItem.Icon />
							{/if}
							<span>{menuItem.label}</span>
						</Sidebar.MenuButton>
					{/snippet}
				</Collapsible.Trigger>
				<Collapsible.Content>
					<Sidebar.MenuSub>
						{#each menuItem.children as child (child.href)}
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
					<a href={resolve(menuItem.href)} {...props}>
						{#if menuItem.Icon}
							<menuItem.Icon />
						{/if}
						<span>{menuItem.label}</span>
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	{/if}
{/snippet}

<Sidebar.Root bind:ref style="top: {top}px;">
	<CsSidebarTrigger
		class="absolute top-[calc(50vh-32px)] right-1 h-16 w-6 rounded-md transition-none"
		hidden={!sidebar.open}
	/>
	<CsSidebarTrigger
		class="absolute top-[calc(50vh-32px)] -right-7 h-16 w-6 rotate-180 rounded-md transition-none"
		hidden={sidebar.open}
	/>
	{#if sb.option?.header}
		<Sidebar.Header>
			{@render sb.option.header()}
		</Sidebar.Header>
	{/if}
	<Sidebar.Content class="p-2">
		<Sidebar.Menu>
			{#if sb.itemData && sb.itemData.get('root')}
				{@render mitem(sb.itemData.get('root'))}
			{/if}
		</Sidebar.Menu>
	</Sidebar.Content>
	{#if sb.option?.footer}
		<Sidebar.Footer>
			{@render sb.option.footer()}
		</Sidebar.Footer>
	{/if}
</Sidebar.Root>
