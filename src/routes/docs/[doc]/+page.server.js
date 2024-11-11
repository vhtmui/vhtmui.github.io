import { readFile } from 'node:fs/promises';
/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	// get content
	const { mdContent } = await parent();
	return { mdContent };
}
