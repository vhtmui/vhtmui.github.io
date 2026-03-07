<script>
	import { Copy, Check } from 'lucide-svelte';
	import Button from '$lib/components/my/CsButton.svelte';
	import { copyToClipboard } from '$lib/my-utils';

	let { textContent, delay = 0, class: className } = $props();

	let copied = $state(false);

	async function handleCopy() {
		if (copied) return;
		await copyToClipboard(textContent);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, delay);
	}
</script>

<div class={'flex items-center align-middle ' + className}>
	<span class="mr-auto">{textContent}</span>
	<Button
		class="ml-1"
		onclick={handleCopy}
		disabled={copied || textContent.length === 0}
	>
		{#if copied}
			<Check />
		{:else}
			<Copy />
		{/if}
	</Button>
</div>
