<script>
  import favicon from "$lib/assets/favicon.svg";
  import { ModeWatcher } from "mode-watcher";
 
  import "./layout.css";
  import Header from "$lib/components/my/Header.svelte";

  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />
<Header />
{@render children()}
