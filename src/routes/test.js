import { readdir } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { buildTree } from '../lib/ZSibar/Znav.js';

const items = await readdir('src/routes', { recursive: true, withFileTypes: true });

const dir = items
	.filter((d) => d.isDirectory())
	.map((d) => {
		return normalize(join(d.parentPath, d.name));
	});

dir.forEach((d) => {
	console.log(d);
});

const tree = buildTree({ _link: '/', _title: 'Home' }, dir);
console.log(tree);
