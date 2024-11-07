<script>
	import { preventDefault } from 'svelte/legacy';

	let {data} =$props();

</script>

<form method="POST" onsubmit={(event)=>event.preventDefault()}>
	<label>
		add a todo:
		<input name="description" autocomplete="off" />
	</label>
</form>

<p>{data.db}</p>