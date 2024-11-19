<script>
	import ZBlurBtn from '$lib/ZBlurBtn/ZBlurBtn.svelte';
	import ZIcon from '../ZIcon/ZIcon.svelte';

	import { onMount } from 'svelte';

	let BtnList = $state([false, false, false]);

	let currentBtn;

	// Set svg color.
	let fill = 'var(--all-svg-color)';
	let stroke = 'var(--all-svg-color)';

	let width = '5rem';

	function setTheme(theme) {
		if (theme === 'Dark' || theme === 'Light') {
			document.documentElement.setAttribute('data-theme', theme);
			localStorage.setItem('theme', theme);
		} else if (theme === 'Auto') {
			localStorage.setItem('theme', 'Auto');
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				document.documentElement.setAttribute('data-theme', 'Dark');
			} else {
				document.documentElement.setAttribute('data-theme', 'Light');
			}
		}
	}
	function setCurrentBtn(index) {
		BtnList[currentBtn] = false;
		BtnList[index] = true;
		currentBtn = index;
	}

	onMount(() => {
		const initTheme = localStorage.getItem('theme');
		// init theme button
		if (initTheme === 'Light') {
			setCurrentBtn(0);
		} else if (initTheme === 'Dark') {
			setCurrentBtn(1);
		} else {
			setCurrentBtn(2);
		}
	});
</script>

<div class="themeBlock">
	<div class="theme-btnContainer">
		<div class="btnBlock {BtnList[0] ? 'selected' : ''}">
			<ZBlurBtn
				type="button"
				{width}
				onclick={() => {
					setTheme('Light');
					setCurrentBtn(0);
				}}
			>
				Light
				<ZIcon option="sun" {fill} />
			</ZBlurBtn>
		</div>
		<div class="btnBlock {BtnList[1] ? 'selected' : ''}">
			<ZBlurBtn
				{width}
				type="button"
				onclick={() => {
					setTheme('Dark');
					setCurrentBtn(1);
				}}
				>Dark
				<ZIcon option="moon" {fill} />
			</ZBlurBtn>
		</div>
		<div class="btnBlock {BtnList[2] ? 'selected' : ''}">
			<ZBlurBtn
				{width}
				type="button"
				onclick={() => {
					setTheme('Auto');
					setCurrentBtn(2);
				}}
				>Auto
				<ZIcon option="monitor" {fill} />
			</ZBlurBtn>
		</div>
	</div>
</div>

<style>
	div.themeBlock :global {
		display: flex;
		position: relative;
		width: 5rem;
		height: var(--header-block-height);
		justify-content: center;
		& .theme-btnContainer {
			display: flex;
			flex-direction: column;
			position: relative;
			box-sizing: border-box;
			width: 100%;
			height: 100%;
			border-radius: 0.7rem;
			.btnBlock {
				visibility: hidden;
				position: absolute;
				top: 0;
				transition: top cubic-bezier(0.165, 0.84, 0.44, 1) 300ms 70ms;
				button {
					color: var(--header-text-color);
					&:hover {
						color: var(--header-text-hover-color);
					}
					&:active {
						transition: none;
					}
				}
				&.selected {
					visibility: visible;
					z-index: 10;
				}
			}
			&:hover {
				height: 300%;
				.btnBlock {
					transition: top cubic-bezier(0.165, 0.84, 0.44, 1) 300ms 70ms;
					visibility: visible;
					&:nth-child(1 of :not(.selected)) {
						top: var(--header-block-height);
					}
					&:nth-child(2 of :not(.selected)) {
						top: calc(2 * var(--header-block-height));
					}
				}
			}
		}
	}
</style>
