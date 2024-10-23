<script>
	import { onMount } from 'svelte';
	import Icon from '../Icon/Icon.svelte';

	function setTheme(theme) {
		if (theme === 'Dark' || theme === 'Light') {
			document.documentElement.setAttribute('data-theme', theme);
			localStorage.setItem('theme', theme);
		} else if (theme === 'Auto') {
			localStorage.setItem('theme','Auto');
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				document.documentElement.setAttribute('data-theme', 'Dark');
			} else {
				document.documentElement.setAttribute('data-theme', 'Light');
			}
		}
	}
	onMount(() => {
		const btns = document.querySelector('div.theme.btnContainer');
		btns.addEventListener('click', (event) => {
			const btn = event.target.closest?.('button');
			if (btn.className.includes('Dark')) {
				setTheme('Dark');
			} else if (btn.className.includes('Light')) {
				setTheme('Light');
			} else {
				setTheme('Auto');
			}

			for (const child of btn.parentNode.children) {
				child.classList.remove('selected');
			}
			btn.classList.add('selected');
		});
		// init button icon
		const theme = localStorage.getItem('theme');
		if (theme) {
			document.querySelectorAll('div.theme.btnContainer button').forEach((ele) => {
				if (ele.className.includes(theme)) {
					ele.classList.add('selected');
					return;
				}
			});
		} else {
			document.querySelector('div.theme.btnContainer button.Auto').classList.add('selected');
		}
	});
</script>

<div class="themeBlock" data-theme>
	<div class="theme btnContainer">
		<button type="button" class="svg Light">
			Light <Icon option="sun" />
		</button>
		<button class="svg Dark">
			Dark <Icon option="moon" />
		</button>
		<button class="svg Auto">
			Auto <Icon option="monitor" />
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
				border: none;
				border-radius: 0;
				outline: none;
				background-color: transparent;
				opacity: 0;
				transition: all cubic-bezier(0.165, 0.84, 0.44, 1) 200ms;
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
