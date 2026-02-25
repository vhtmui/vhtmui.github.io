import { walkDir } from '$lib/my_utils';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const docItems = await walkDir('docs');

    return { docItems };
}
