<script>
	import ZSbarContainer from './ZSbarContainer.svelte';
    import {leftDisplay} from '$lib/shared.svelte';

	import { slide } from 'svelte/transition';

	let { Dirs, ZSibar = $bindable() } = $props();

	/**
	 * @type {number} - bind to the `clientWidth` of `div.sidebar-container`
	 */
	let SibarWidth = $state();

	/**
	 * @type {number} - bind to the `div.mobilesidebar-container`'s width
	 */
	let mobileSibarWidth = $state();

</script>

{#if leftDisplay.displayPC}
	<div
		class="sidebar-container"
		transition:slide={{ duration: 300, axis: 'x' }}
		bind:clientWidth={SibarWidth}
	>
		<div class="sibar-innercontainer" style="width: {SibarWidth}px;">
			<ZSbarContainer {Dirs} signal="expandAll" width={`${SibarWidth}px`} />
		</div>
	</div>
{/if}
{#if leftDisplay.displayMobile}
	<div class="mobilesidebar-container">
		<div
            bind:this = {ZSibar}
			bind:clientWidth={mobileSibarWidth}
			class="sibar-innercontainer"
			transition:slide|global={{ axis: 'x' }}
		>
			<ZSbarContainer {Dirs} signal="expandAll" width={`${mobileSibarWidth}px`} />
		</div>
	</div>
{/if}
