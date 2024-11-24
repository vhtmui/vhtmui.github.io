<script>
	import ZIcon from "$lib/ZIcon/ZIcon.svelte";

	let { children } = $props();
</script>

<div>
	<code> {children}</code>
    <div><ZIcon option="copy"></ZIcon></div>
</div>
