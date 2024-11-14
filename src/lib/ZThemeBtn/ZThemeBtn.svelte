<script>
	import ZIcon from '../ZIcon/ZIcon.svelte';

	import { onMount } from 'svelte';

	let { initTheme } = $props();

	let BtnList = $state([false, false, false]);
	let currentBtn = $state();

	function setTheme(theme) {
		if (theme === 'Dark' || theme === 'Light') {
			document.documentElement.setAttribute('data-theme', theme);
			document.cookie = `theme=${theme};path=/`;
		} else if (theme === 'Auto') {
			document.cookie = `theme=Auto;path=/`;
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

	// init theme button
	if (initTheme === 'Light') {
		setCurrentBtn(0);
	} else if (initTheme === 'Dark') {
		setCurrentBtn(1);
	} else {
		setCurrentBtn(2);
	}
	$inspect(initTheme)
</script>

<div class="themeBlock">
	<div class="theme btnContainer">
		<button
			type="button"
			class="svg Light"
			class:selected={BtnList[0]}
			onclick={() => {
				setTheme('Light');
				setCurrentBtn(0);
			}}
		>
			Light <ZIcon option="sun" />
		</button>
		<button
			type="button"
			class="svg Dark"
			class:selected={BtnList[1]}
			onclick={() => {
				setTheme('Dark');
				setCurrentBtn(1);
			}}
		>
			Dark <ZIcon option="moon" />
		</button>
		<button
			type="button"
			class="svg Auto"
			class:selected={BtnList[2]}
			onclick={() => {
				setTheme('Auto');
				setCurrentBtn(2);
			}}
		>
			Auto <ZIcon option="monitor" />
		</button>
	</div>
</div>

<style>
	div.themeBlock :global {
		display: flex;
		position: relative;
		width: 5rem;
		height: var(--header-block-height);
		justify-content: center;
		&:hover {
			cursor: pointer;
			background-color: transparent;
		}
		& svg {
			vertical-align: middle;
			& path {
				fill: var(--all-svg-color);
			}
		}
		& div.btnContainer {
			display: flex;
			flex-direction: column;
			position: relative;
			box-sizing: content-box;
			width: 100%;
			height: 100%;
			background-color: var(--header-btn-bg-color);
			backdrop-filter: blur(10px);
			border-radius: 0.7rem;
			& button.svg {
				color: unset;
				font-family: 'Intel', 'Microsoft YaHei', Arial, sans-serif;
				display: block;
				visibility: hidden;
				position: absolute;
				top: 0;
				box-sizing: content-box;
				width: 100%;
				margin: 0;
				padding: 0;
				line-height: var(--header-block-height);
				border: 0px solid;
				border-radius: 0;
				outline: none;
				background-color: transparent;
				opacity: 0;
				transition: all cubic-bezier(0.165, 0.84, 0.44, 1) 300ms 70ms;
				&:hover {
					cursor: pointer;
					color: var(--header-text-hover-color);
					& path {
						fill: var(--header-text-hover-color);
						stroke: var(--header-text-hover-color);
					}
				}
				&:active {
					transition: none;
				}
				&.selected {
					opacity: 1;
					visibility: visible;
				}
			}
			&:hover {
				height: 300%;
				& button.svg {
					opacity: 1;
					transition: all cubic-bezier(0.165, 0.84, 0.44, 1) 300ms 70ms;
					visibility: visible;
					border: none;
					--ThemeBtn-border: 1px solid var(--header-border-color);
					&:nth-child(1 of :not(.selected)) {
						top: var(--header-block-height);
						border-top: var(--ThemeBtn-border);
					}
					&:nth-child(2 of :not(.selected)) {
						top: calc(2 * var(--header-block-height));
						border-top: var(--ThemeBtn-border);
					}
				}
			}
		}
	}
</style>
