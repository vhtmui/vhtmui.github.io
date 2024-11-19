import * as ease from "svelte/easing";

export function slideWithPadding(node, { delay = 0, duration = 400, axis }) {
    const width = window.getComputedStyle(node).width;
    const padding = window.getComputedStyle(node).padding.split(' ').map(Number);
    return {
        delay,
        duration,
        axis,
        easing: ease.quadOut,
        css(t, u) {
            return `
					position: sticky;
					overflow: hidden;
					min-width: 0;
					padding: ${padding[0] * t} ${padding[1] * t} ${padding[2] * t} ${padding[3] * t};
					width:${parseInt(width.replace('px', '')) * t}px;
				`;
        }
    };
}

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