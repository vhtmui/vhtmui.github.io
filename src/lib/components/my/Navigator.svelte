<script>
	import { page } from '$app/state';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { resolve } from '$app/paths';

	let base = resolve('').replaceAll('/', '');
	if (base === '') base = '/';

	let pathName_items = $derived.by(() => {
		let pn_array = ['/'].concat(page.url.pathname.split('/').filter(Boolean));

		if (base in pn_array) {
			pn_array = [base].concat(pn_array.splice(0, pn_array.indexOf(base) + 1));
		}

		return pn_array.map((pathname, index) => {
			let name = pathname === '/' ? 'Home' : pathname;
			let href = pn_array
				.map((v) => (v === '/' ? '' : v))
				.slice(0, index + 1)
				.join('/');
			if (href === '') href = '/';
			// 该href无需格式化或拼接
			return { name, href };
		});
	});
</script>

<div class="mr-auto w-full">
	<Breadcrumb.Root>
		<Breadcrumb.List>
			{#each pathName_items as item, i (item.href)}
				<Breadcrumb.Item>
					{#if i === pathName_items.length - 1}
						<Breadcrumb.Page>{item.name}</Breadcrumb.Page>
					{:else}
						<Breadcrumb.Link href={item.href}>
							{item.name}
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
