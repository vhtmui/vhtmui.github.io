import { readable, writable } from 'svelte/store';

const theme_dark = {
    main_nav_bg_color: '#566573',
    main_border_color: '#F2F3F4',
    main_text_color: '#FDFEFE',
}
const theme_light = {
    main_nav_bg_color: '#FFFFFF',
    main_border_color: '#2C3E50',
    main_text_color: '#2C3E50',
}

export const clr = writable(theme_dark);

/**
 * @param {string} theme
 */
export function toggle_theme(theme) {
    switch (theme) {
        case 'Dark':
            clr.set(theme_dark)
            break;
        case 'Light':
            clr.set(theme_light)
            break;
        default:
            console.log("undefined theme");
    }
}

