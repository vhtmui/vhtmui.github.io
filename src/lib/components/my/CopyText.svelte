<script>
  import { Copy, Check } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";

  let { text } = $props();

  let copied = $state(false);
  const copyToClipboard = async () => {
    if (navigator.clipboard) {
      // 使用现代 Clipboard API
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    } else {
      // 降级到传统方法
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
      document.body.removeChild(textArea);
    }
  };
  function handleCopy() {
    copyToClipboard();
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1500);
  }
</script>

<div class="flex align-middle items-center">
  <span class="mr-auto">{text}</span>
  <Button
    onClick={handleCopy}
    variant="ghost"
    size="icon"
    disabled={copied || text.length === 0}
  >
    {#if copied}
      <Check />
    {:else}
      <Copy />
    {/if}
  </Button>
</div>
