<script>
	import { useSidebar } from '@ui/sidebar/context.svelte.js';
	import { cn } from '$lib/utils.js';
	import Button from '$lib/components/my/CsButton.svelte';
	import { ChevronLeft } from '@lucide/svelte';

	let { class: className, ...restProps } = $props();

	let sidebar = useSidebar();
</script>

<Button class={cn('', className)} onclick={sidebar.toggle} {...restProps}>
	<ChevronLeft />
</Button>
