
let db = null;

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return { db };
}

