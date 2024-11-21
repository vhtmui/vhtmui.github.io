import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent, params }) {
	// get content
	const data = await parent();
	const current = data.mdContent.findIndex((c) => c.doc === params.doc);
	const content = data.mdContent[current]?.content;

	if (!content) error(404);

	return { content };
}
