<script>
	import { page } from '$app/state';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { formatUrl } from '$lib/my-utils';

	let pathName_items = $derived.by(() => {
		const pn_array = ['/'].concat(page.url.pathname.split('/').filter(Boolean));

		return pn_array.map((pathname, index) => {
			let name = pathname === '/' ? 'Home' : pathname;
			let href = pn_array.slice(0, index + 1).join('/');
			if (href === '') href = '/';
			return { href: formatUrl(href), name };
		});
	});
</script>

<div class="mr-auto w-full">
	<Breadcrumb.Root>
		<Breadcrumb.List>
			{#each pathName_items as items, i}
				<Breadcrumb.Item>
					{#if i === pathName_items.length - 1}
						<Breadcrumb.Page>{items.name}</Breadcrumb.Page>
					{:else}
						<Breadcrumb.Link href={items.href}>
							{items.name}
						</Breadcrumb.Link>
					{/if}
				</Breadcrumb.Item>
				{#if i !== pathName_items.length - 1}
					<Breadcrumb.Separator />
				{/if}
			{/each}
		</Breadcrumb.List>
	</Breadcrumb.Root>
</div>
