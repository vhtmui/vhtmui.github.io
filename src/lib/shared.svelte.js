/**
 * @property {boolean} display - Indicate sidebar's display.
 * @property {boolean} displayToc - Indicate right sidebar's display.
 */
export const displays = $state({ 
    display: false, 
    displayToc: false 
});

/**
 * @property {boolean} displayPC - Indicate right sidebar's display on PC.
 * @property {boolean} displayMobile - Indicate right sidebar's display on mobile.
 */
export const leftDisplay = $state({
    displayPC: false,
    displayMobile: false
})