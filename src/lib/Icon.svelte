<script>
	// @ts-nocheck

	import { paths } from '$lib/icon';

	export let option = 'sun';

	export let viewBox;
	export let height = '1.5em';
	export let width = '1.5em';

	let path = paths[option];
</script>

<svg {viewBox} {height} {width}>{@html path}</svg>
