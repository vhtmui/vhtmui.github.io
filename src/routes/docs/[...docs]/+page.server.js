import { readFile } from 'node:fs/promises';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const content = await readFile(`docs/${params.docs}.md`, 'utf-8');

    // 提取标题
    const headings = [];
    const lines = content.split(/\r?\n/);
    lines.forEach((line) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            headings.push({ level, text, id });
        }
    });

    return { content, headings };
}