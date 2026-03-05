<script module>
	import { cn } from '$lib/utils';
	export { h1, h2, h3, h4, h5, h6 };
</script>

{#snippet h1(props)}
	{@const { children, style, class: className, ...rest } = props}
	<h1
		class={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', className)}
		{style}
		{...rest}
	>
		{@render children?.()}
	</h1>
{/snippet}

{#snippet h2(props)}
	<h2 color="red" {...props}></h2>
{/snippet}

{#snippet h3(props)}
	<h3 color="red" {...props}></h3>
{/snippet}

{#snippet h4(props)}
	<h4 color="red" {...props}></h4>
{/snippet}

{#snippet h5(props)}
	<h5 color="red" {...props}></h5>
{/snippet}

{#snippet h6(props)}
	<h6 color="red" {...props}></h6>
{/snippet}

<style>
</style>
