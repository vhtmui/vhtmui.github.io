<script>
	import Button from '@ui/button/button.svelte';
	import {formatUrl} from '$lib/my-utils';

	const className =
		'text-2xl font-bold grow min-w-50 max-w-1/1 h-50 flex items-center justify-center whitespace-normal text-center';
	const variant = 'outline';
</script>

<div class="flex min-h-screen w-full flex-wrap items-start gap-8 p-10">
	<Button {variant} class={className} href={formatUrl("/mac-converter")}>MAC Address Converter</Button>
	<Button {variant} class={className} href={formatUrl("/dufs")}>Dufs</Button>
	<Button {variant} class={className} href={formatUrl("/docs")}>Docs</Button>
	<Button {variant} class={className} href={formatUrl("/testpage")}>Test Page</Button>
</div>
