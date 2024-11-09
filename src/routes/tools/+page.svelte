<script>
	import { preventDefault } from 'svelte/legacy';
	import { goto } from '$app/navigation';

	let {data} =$props();

	function g(){
		goto('/docs');;
		console.log('nav to tools');
	}

</script>

<form method="POST" onsubmit={(event)=>event.preventDefault()}>
	<label>
		add a todo:
		<input name="description" autocomplete="off" />
	</label>
</form>

<button type="button" onclick={g}>
	aaa
</button>

<p>{data.db}</p>