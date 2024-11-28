import { readdir } from 'node:fs/promises';

const docDir = 'docs/';
let docItems = await readdir(docDir, { recursive: true, withFileTypes: true });
docItems = docItems.filter(docItem => docItem.name.endsWith('.md'));
debugger;