<script>
	// @ts-nocheck

	import { paths, viewBoxs } from './icon';

	export let option = 'sun';

	export let height = '1.25rem';
	export let width = '1.25rem';

	$: viewBox = viewBoxs[option];
	$: path = paths[option];
</script>

<svg {viewBox} {height} {width}>{@html path}</svg>

<style>
</style>
