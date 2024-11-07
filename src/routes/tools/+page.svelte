<script>
	let {data} =$props();

</script>

<form method="POST">
	<label>
		add a todo:
		<input name="description" autocomplete="off" />
	</label>
</form>

<p>{data.db}</p>