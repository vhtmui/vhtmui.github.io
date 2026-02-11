<script>
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import Button from "$lib/components/ui/button/button.svelte";
  import { ModeWatcher } from "mode-watcher";
  import Header from "$lib/components/my/Header.svelte";

  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />
<Header />
{@render children()}
