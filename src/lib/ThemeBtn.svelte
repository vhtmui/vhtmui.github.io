<script>
  import Sicon from "./Icon.svelte";

  let c = "Auto";
  let icon = "monitor";
</script>

<div class="themeBlock" data-theme={c}>
  <Sicon option={icon} />
  <button
    class="svg Light"
    on:click={() => {
      c = "Light";
      icon = "sun";
    }}
  >
    Light<Sicon option={"sun"} />
  </button>
  <button
    class="svg Dark"
    on:click={() => {
      c = "Dark";
      icon = "moon";
    }}
  >
    Dark<Sicon option={"moon"} />
  </button>
  <button
    class="svg Auto"
    on:click={() => {
      c = "Auto";
      icon = "monitor";
    }}
  >
    Auto<Sicon option={"monitor"} />
  </button>
</div>

<style>
  div.themeBlock > button {
    visibility: hidden;
  }
  div.themeBlock:hover > button {
    visibility: visible;
  }
</style>
