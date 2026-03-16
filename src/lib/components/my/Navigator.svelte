<script>
	import { page } from '$app/state';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	const githubUrl = 'vhtmui.github.io';

	let pathName_items = $derived.by(() => {
		let pn_array = page.url.pathname.split('/').filter(Boolean);

		let hasGithubUrl = false;
		if (pn_array.includes(githubUrl)) {
			pn_array = pn_array.splice(pn_array.indexOf(githubUrl));
			hasGithubUrl = true;
		}

		const pn = pn_array.map((pathname, index) => {
			let name = pathname;
			let href = '/' + pn_array.slice(0, index + 1).join('/');
			return { name, href };
		});

		if (hasGithubUrl) {
			pn[0] = { name: 'Home', href: '/' + githubUrl };
		} else {
			pn.unshift({ name: 'Home', href: '/' });
		}

		return pn;
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
