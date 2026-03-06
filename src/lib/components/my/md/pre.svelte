<script module>
	import { cn } from '$lib/utils';
	export { pre };
</script>

{#snippet pre(props)}
	{@const { children, style, class: className, ...rest } = props}
	<pre class={cn('mockup-code', className)} {style} {...rest}>{@render children?.()}</pre>
{/snippet}
