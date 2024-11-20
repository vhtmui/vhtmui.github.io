
import { readFile, readdir } from 'node:fs/promises';
import * as path from 'node:path';

// get dir array, pass to `ZSbarContainer.svelte`
const baseDir = 'src/routes';
const items = await readdir(baseDir, { recursive: true, withFileTypes: true });
let directory = items
	.filter((d) => d.isDirectory())
	.map((d) => path.join(d.parentPath, d.name).replaceAll('\\', '/').replaceAll(baseDir, ''));

const docDir = 'docs/';
const docItems = await readdir(docDir, { recursive: true, withFileTypes: true });
const docDirectory = docItems.map((d) => path.join(d.parentPath, d.name).replaceAll('\\', '/').replaceAll(docDir, '/docs/').replace('.md', ''));

directory = [...directory, ...docDirectory];

// get markdown.

// let mdContent = await readFile('docs/PowerShell.md', 'utf-8');

let mdContent = new Map();

for (const docItem of docItems) {
	const name = docItem.name.replace('.md', '');
	const docPath = path.join(docItem.parentPath, docItem.name);
	const content = await readFile(docPath, 'utf-8');
	mdContent.set(name, content);
}

console.log({ directory });
debugger