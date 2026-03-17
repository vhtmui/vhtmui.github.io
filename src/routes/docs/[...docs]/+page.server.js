import { readFile } from 'node:fs/promises';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const content = await readFile(`docs/${params.docs}.md`, 'utf-8');

	return { content, docName: params.docs };
}
