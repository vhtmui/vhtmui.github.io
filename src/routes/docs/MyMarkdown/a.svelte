<script>
	import { resolve } from '$app/paths';
	export { a };
</script>

{#snippet a(props)}
	{@const { children, style, href, class: className, ...rest } = props}
	<a class={className} {style} {href} {...rest}>
		{@render children?.()}
	</a>
{/snippet}
