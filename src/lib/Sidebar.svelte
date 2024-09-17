<script>
	import { get_child_array } from '../routes/nav';

	export let tree;
</script>

<ul>
	{#if tree}
		{#each tree as t}
			<li><a href={t.$link}>{t.$link}</a></li>
		{/each}
	{/if}
</ul>

<style>
</style>
