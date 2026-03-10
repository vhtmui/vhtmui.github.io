<script>
	import { cn } from '$lib/utils';
	import { getAstNode } from 'svelte-exmarkdown';
	import { onMount } from 'svelte';

	let { children, class: ClassName, ...restProps } = $props();

	let activeId = $state('');

	const ast = getAstNode();
	$inspect(ast);
</script>

<nav class={cn('not-prose', ClassName)} {...restProps}>
	{@render children?.()}
</nav>