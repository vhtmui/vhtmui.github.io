<script>
	import { cn } from '$lib/utils';
	import Button from '$lib/components/my/CsButton.svelte';
	import { Copy, Check } from '@lucide/svelte';
	import { copyToClipboard } from '$lib/my-utils';

	let { children, class: className, ...rest } = $props();

	/** @type {HTMLPreElement} */
	let pre = $state();

	async function handleClick() {
		if (buttonState.copied) return;
		const codeText = pre.textContent;
		await copyToClipboard(codeText);
		buttonState.copied = true;
		setTimeout(() => {
			buttonState.copied = false;
		}, 2000);
	}

	const buttonState = $state({
		copied: false
	});

	const CopyIcon = $derived(buttonState.copied ? Check : Copy);
</script>

<div class="relative">
	<pre
		contenteditable="false"
		bind:this={pre}
		class={cn('border-2', className)}
		{...rest}>{@render children?.()}</pre>
	<Button
		size="icon"
		variant="outline"
		class="local-btn absolute top-2 right-2"
		disabled={buttonState.copied}
		onclick={handleClick}><CopyIcon /></Button
	>
</div>

<style>
	pre {
		padding-right: 3rem;
		scrollbar-width: thin;
	}

	.relative:hover :global(.local-btn) {
		display: inline-flex
	}

	.relative :global(.local-btn) {
		display: none;
	}
</style>
