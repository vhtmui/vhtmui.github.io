import { readFile, readdir } from "node:fs/promises";
import * as path from "node:path";

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {

    const docDir = 'Docs/';
    const docItems = await readdir(docDir, { recursive: true, withFileTypes: true });

    const mdContent = await Promise.all(
        docItems.map(async (docItem) => ({
            doc: docItem.name.replace('.md', ''),
            content: await readFile(path.join(docItem.parentPath, docItem.name), 'utf-8')
        }))
    )

    return { mdContent };
}