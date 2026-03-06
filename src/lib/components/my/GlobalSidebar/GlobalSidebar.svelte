<script>
	import * as Sidebar from '@ui/sidebar/index.js';
	import * as Collapsible from '@ui/collapsible/index.js';
	import { sb } from './context.svelte.js';
	import { useSidebar } from '@ui/sidebar/context.svelte.js';

	let { ref = $bindable(null), top } = $props();

	const sidebar = useSidebar();

	let triggerStyle = $derived(
		sidebar.open
			? sidebar.openMobile
				? 'display: none;'
				: 'right: 0; transform: rotate(0deg);'
			: 'right: -36px; transform: rotate(180deg);'
	);
</script>

{#snippet mitem(/** @type {GlobalSidebarMenuItem} */ menuItem)}
	{#if menuItem.children.length > 0}
		<Collapsible.Root bind:open={menuItem.open} class="group/collapsible">
			<Sidebar.MenuItem>
				<Collapsible.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton {...props}>
							{#if menuItem.icon}
								<menuItem.icon />
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

<Sidebar.Root bind:ref style="top: {top}px;">
	<Sidebar.Trigger
		style="position: absolute; top: calc(50vh - 32px); {triggerStyle} width: 24px; height: 64px; border-radius: 12px; transition: all 0.3s ease;"
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
