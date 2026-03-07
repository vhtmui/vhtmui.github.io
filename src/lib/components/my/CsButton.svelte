<script>
	import { cn } from '$lib/utils';
	import Button from '@ui/button/button.svelte';

	let {
		class: className,
		variant = 'ghost',
		size = 'icon',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		children,
		...restProps
	} = $props();
</script>

<Button
	class={cn('cursor-pointer hover:text-primary', className)}
	{variant}
	{size}
	bind:ref
	{href}
	{type}
	{disabled}
	{...restProps}
>
	{@render children?.()}
</Button>
