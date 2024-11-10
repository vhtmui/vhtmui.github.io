import { readFile, readdir } from 'node:fs/promises';
import * as path from 'node:path';

/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
	const t = event.cookies.get('theme');

	// const items = await readdir('src/routes', { recursive: true, withFileTypes: true });

	// const dir = items
	// 	.filter((d) => d.isDirectory())
	// 	.map((d) => {
	// 		return path.normalize(path.join(d.parentPath, d.name));
	// 	});
	// const content = readFile('./tree.js');

	return { theme: t};
}
