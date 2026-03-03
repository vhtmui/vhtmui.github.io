<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
	import { useSidebar } from './context.svelte.js';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';

	let { ref = $bindable(null), class: className, onclick, ...restProps } = $props();

	const sidebar = useSidebar();
</script>

<Button
	data-sidebar="trigger"
	data-slot="sidebar-trigger"
	variant="ghost"
	size="icon"
	class={cn(className)}
	type="button"
	onclick={(e) => {
		onclick?.(e);
		sidebar.toggle();
	}}
	{...restProps}
>
	<ChevronLeft />
	<span class="sr-only">Toggle Sidebar</span>
</Button>
