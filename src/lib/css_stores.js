/**
 * @param {string} string
 */
export function set_root_theme(string){
    document.documentElement.setAttribute('data-theme', string);
}