<script>
	// @ts-nocheck

	import { paths, viewBoxs } from '$lib/icon';

	export let option = 'sun';

	export let height = '1.3rem';
	export let width = '1.3rem';

	let viewBox = viewBoxs[option];
	$: path = paths[option];
	
</script>

<svg {viewBox} {height} {width}>{@html path}</svg>
