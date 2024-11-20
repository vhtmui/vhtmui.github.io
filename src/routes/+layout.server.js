import { readFile, readdir } from 'node:fs/promises';
import * as path from 'node:path';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	// get dir array, pass to `ZSbarContainer.svelte`
	const baseDir = 'src/routes';
	const items = await readdir(baseDir, { recursive: true, withFileTypes: true });
	let directory = items
		.filter((d) => d.isDirectory())
		.map((d) => path.join(d.parentPath, d.name).replaceAll('\\', '/').replaceAll(baseDir, ''));

	const mdContent = await readFile('docs/PowerShell.md', 'utf-8');

	const docDir = 'docs/';
	const docItems = await readdir(docDir, { recursive: true, withFileTypes: true });
	const docDirectory = docItems.map((d) => path.join(d.parentPath, d.name).replaceAll('\\', '/').replaceAll(docDir, '/docs/'));

	directory = [...directory, ...docDirectory];

	return { directory, mdContent };
}
