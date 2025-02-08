<script>
	import { displays } from '$lib/shared.svelte';
	import { leftDisplay } from '$lib/shared.svelte';
	import ZBlurBtn from '$lib/ZBlurBtn/ZBlurBtn.svelte';
	import ZIcon from '$lib/ZIcon/ZIcon.svelte';
	import ZNav from '$lib/ZNav/ZNav.svelte';
	import ZThemeBtn from '$lib/ZThemeBtn/ZThemeBtn.svelte';
	import ZHeader from '$lib/ZHeader/ZHeader.svelte';
</script>

<ZHeader>
	{#snippet home()}
		<ZBlurBtn>
			<a href="/">
				<ZIcon option={'home'} />
			</a>
		</ZBlurBtn>
	{/snippet}
	{#snippet nav()}
		<ZNav></ZNav>
	{/snippet}
	{#snippet themeToggle()}
		<ZThemeBtn />
	{/snippet}
	{#snippet layoutRight()}
		<ZBlurBtn
			onclick={() => {
				leftDisplay.displayPC = !leftDisplay.displayPC;
				leftDisplay.displayMobile = !leftDisplay.displayMobile;
			}}
		>
			<ZIcon option={'layout'} />
		</ZBlurBtn>
	{/snippet}
	{#snippet layoutLeft()}
		<ZBlurBtn
			style={'transform: rotateY(180deg);'}
			onclick={() => {
				displays.displayToc = !displays.displayToc;
			}}
		>
			<ZIcon option={'layout'} />
		</ZBlurBtn>
	{/snippet}
	{#snippet github()}
		<ZBlurBtn>
			<a href="https://github.com/vhtmui">
				<ZIcon option={'github'} />
			</a>
		</ZBlurBtn>
	{/snippet}
</ZHeader>
