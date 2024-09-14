<script>
	// @ts-nocheck

	import { paths, viewBoxs } from '$lib/icon';

	export let option = 'sun';

	export let height = '1.25rem';
	export let width = '1.25rem';

	let viewBox = viewBoxs[option];
	$: path = paths[option];
	
</script>

<svg {viewBox} {height} {width}>{@html path}</svg>
