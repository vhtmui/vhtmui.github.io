<script>
	import { cn } from '$lib/utils';
	// import { getAstNode } from 'svelte-exmarkdown';

	let { children, class: ClassName, ...restProps } = $props();

	let activeId = $state('');

	// const ast = getAstNode();
	// onMount(() => {
	// 	console.log('AST Node:');
	// 	console.log(ast);
	// });
</script>

<li class={cn('text-blue-800', ClassName)} {...restProps}>
	{@render children?.()}
</li>