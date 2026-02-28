import { walkDir } from '$lib/my-utils';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const docItems = await walkDir('docs', undefined, { includeRoot: true })

    return { docItems };
}
