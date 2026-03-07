<script>
	import { cn } from '$lib/utils';

	let { children, class: className, ...rest } = $props();

	let codeText = $state();

	async function copyToClipboard(text) {
		if (navigator.clipboard) {
			// 使用现代 Clipboard API
			try {
				await navigator.clipboard.writeText(text);
			} catch (err) {
				console.error('Failed to copy text: ', err);
			}
		} else {
			// 降级到传统方法
			const textArea = document.createElement('textarea');
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			try {
				document.execCommand('copy');
			} catch (err) {
				console.error('Failed to copy text: ', err);
			}
			document.body.removeChild(textArea);
		}
	}

	function handleClick() {
		copyToClipboard(codeText);
	}
</script>

<pre
	contenteditable="false"
	bind:innerText={codeText}
	class={cn('', className)}
	{...rest}>{@render children?.()}</pre>
<button onclick={handleClick}> copy </button>

<style>
	button {
		background-color: red;
	}
</style>
