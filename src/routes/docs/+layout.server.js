import { readFile, readdir } from "node:fs/promises";
import * as path from "node:path";

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {

    const docDir = 'docs/';
    let docItems = await readdir(docDir, { recursive: true, withFileTypes: true });
    docItems = docItems.filter((d) => d.isFile() && d.name.endsWith('.md'));

    const mdContent = await Promise.all(
        docItems.map(async (docItem) => ({
            doc: docItem.name.replace('.md', ''),
            content: await readFile(path.join(docItem.parentPath, docItem.name), 'utf-8')
        }))
    )

    return { mdContent };
}