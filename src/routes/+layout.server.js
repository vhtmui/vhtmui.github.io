import { readFile, readdir } from 'node:fs/promises';
import * as path from 'node:path';

/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
	// get theme cookies setted to html atrribute
	const t = event.cookies.get('theme');

	// get dir array, pass to `ZSbarContainer.svelte`
	const baseDir = 'src/routes';
	const items = await readdir(baseDir, { recursive: true, withFileTypes: true });
	const dir = items
		.filter((d) => d.isDirectory())
		.map((d) => path.join(d.parentPath, d.name).replaceAll('\\', '/').replaceAll(baseDir, ''));

	const mdContent = await readFile('docs/PowerShell.md', 'utf-8');

	return { theme: t, dir, mdContent };
}