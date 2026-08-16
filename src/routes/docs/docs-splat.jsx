import { useParams } from '@tanstack/react-router';
import { getDocContent } from '@lib/docs.js';
import { shouldAccessedDoc } from '@lib/my-utils.js';
import { splitFrontmatter } from '@lib/utils.js';
import NotFound from '../not-found.jsx';
import DocArticle from './doc-article.jsx';

/**
 * 对应原项目 src/routes/docs/[...docs]/+page.server.js + +page.svelte。
 */
export default function DocsSplat() {
	const params = useParams({ strict: false });
	const docPath = `docs/${params._splat}`;

	if (!shouldAccessedDoc(docPath)) {
		return <NotFound status={404} message="Not Found" />;
	}

	const rawContent = getDocContent(docPath);
	if (rawContent === undefined) {
		return <NotFound status={404} message="Not Found" />;
	}

	const { content, frontmatter } = splitFrontmatter(rawContent);

	return <DocArticle content={content} frontmatter={frontmatter} docName={params._splat} />;
}
