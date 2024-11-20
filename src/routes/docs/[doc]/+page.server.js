import { readFile } from 'node:fs/promises';
/** @type {import('./$types').PageServerLoad} */
export async function load({ parent, params }) {
	// get content
	const { mdContent } = await parent();

	const content = mdContent.get(params.doc);

	return { content };
}
