/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
    const t = event.cookies.get('theme');
    return {theme:t};
}