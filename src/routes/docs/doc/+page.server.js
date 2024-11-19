import { readFile } from 'node:fs/promises';
/** @type {import('./$types').PageServerLoad} */
export async function load({ parent, cookies }) {
	// get content
	const { mdContent } = await parent();

	const h1 = await readFile('./src/routes/docs/doc/a.txt','utf8');

	return { mdContent ,h1};
}