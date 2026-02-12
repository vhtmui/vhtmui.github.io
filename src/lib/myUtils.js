import { onMount } from 'svelte';

/**
 * Description placeholder
 *
 * @export
 * @param {string} shortcut
 * @param {function} handler
 */
export function useShortCut(shortcut, handler) {
	shortcut = shortcut.toLowerCase();
	if (shortcut.split('+').length !== 2)
		throw new Error("Invalid shortcut format. Please use 'modifier+key'.");

	onMount(() => {
		/**
		 * @param {KeyboardEvent} event
		 */
		function handleKeyDown(event) {
			const [modifier, key] = shortcut.split('+');

			const isModifierPressed =
				(modifier === 'ctrl' && event.ctrlKey) ||
				(modifier === 'alt' && event.altKey) ||
				(modifier === 'shift' && event.shiftKey) ||
				(modifier === 'meta' && event.metaKey); // Meta 对应 Cmd 键（Mac）

			const isTargetKeyPressed = event.key.toLowerCase() === key;

			if (isModifierPressed && isTargetKeyPressed) {
				event.preventDefault();
				handler();
			}
		}

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
}
