<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { resolve } from '$app/paths';
	import LinkCard from '$lib/components/my/LinkCard.svelte';

	const className =
		'text-2xl font-bold grow min-w-50 max-w-1/1 h-50 flex items-center justify-center whitespace-normal text-center';
	const variant = 'outline';
</script>

<div class="flex min-h-screen w-full flex-wrap items-start gap-8 p-10">
	<LinkCard href="/mac-converter">
		<div class={className}>Mac Address Converter</div>
	</LinkCard>
	<LinkCard href="/dufs">
		<div class={className}>Dufs</div>
	</LinkCard>
	<LinkCard href="/docs">
		<div class={className}>Docs</div>
	</LinkCard>
	<LinkCard href="/testpage">
		<div class={className}>Test Page</div>
	</LinkCard>
</div>
