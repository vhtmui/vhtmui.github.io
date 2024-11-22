import * as ease from "svelte/easing";

export function scaleX(node, { delay = 0, duration = 200, direction = 'left' }) {
    return {
        delay,
        duration,
        easing: ease.quadOut,
        css(t, u) {
            return `
                    width: max-content;
					overflow: hidden;
					transform: scaleX(${t});
					transform-origin: ${direction};
				`;
        }
    };
}