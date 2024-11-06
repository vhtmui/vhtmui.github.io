/** @type {import('./$types').LayoutServerLoad} */
import { posts } from './data';

export async function load() {
	return {
		summaries: posts.map((post) => ({
			slug: post.slug,
			title: post.title
		}))
	};
}
