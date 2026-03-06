<script>
	import { resolve } from '$app/paths';
	import { cn } from '$lib/utils';

	let { children, class: ClassName, href, ...rest } = $props();
</script>

<a href={resolve(href)} class={cn('hover-3d cursor-pointer', ClassName)} {...rest}>
	<!-- content -->
	<div class="card bg-base-300 text-base-content shadow-base-100">
		<div class="card-body">
			<div class="mr-auto flex justify-between">
				{@render children?.()}
			</div>
		</div>
	</div>

	<!-- 8 empty divs needed for the 3D effect -->
	<div></div>
	<div></div>
	<div></div>
	<div></div>
	<div></div>
	<div></div>
	<div></div>
	<div></div>
</a>