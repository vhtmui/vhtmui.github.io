/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	let { mdContent } = await parent();

	return { mdContent };
}
