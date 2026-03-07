<script>
	import { useSidebar } from '@ui/sidebar/context.svelte.js';
	import { cn } from '$lib/utils.js';
	import Button from '@ui/button/button.svelte';
	import { ChevronLeft } from '@lucide/svelte';

	let { class: className, ...restProps } = $props();

	let sidebar = useSidebar();
</script>

<Button variant="ghost" class={cn('', className)} onclick={sidebar.toggle} {...restProps}>
	<ChevronLeft />
</Button>
