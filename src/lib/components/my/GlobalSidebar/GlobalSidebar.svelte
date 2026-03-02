<script>
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { GlobalSidebarMenuItem, sb } from './context.svelte.js';

	$inspect(sb);
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
