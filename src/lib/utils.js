import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import matter from 'gray-matter';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function splitFrontmatter(markdown) {
	if (typeof markdown !== 'string') {
		return { frontmatter: {}, content: '' };
	}

	const parsed = matter(markdown);
	return {
		frontmatter: parsed.data ?? {},
		content: parsed.content
	};
}
