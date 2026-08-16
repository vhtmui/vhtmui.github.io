import { Link } from '@tanstack/react-router';
import { docItems } from '@lib/docs.js';

/** 对应原项目 src/routes/docs/+page.svelte */
export default function DocsIndex() {
	return (
		<ul>
			{docItems.map((dl) => (
				<li key={dl.relativePath}>
					<Link to={'/' + dl.relativePath.replace('.md', '')}>
						{dl.name.replace('.md', '')}
					</Link>
				</li>
			))}
		</ul>
	);
}
