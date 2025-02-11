/**
 * @property {boolean} displayToc - Indicate right sidebar's display.
 */
export const rightDisplay = $state({ 
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