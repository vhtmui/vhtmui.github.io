import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeToc from 'rehype-toc';
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { createOnigurumaEngine } from 'shiki';
import { createHighlighterCore } from 'shiki/core';

import * as MD from './MyMarkdown/index.js';

/**
 * 把 markdown 中的原始 HTML 节点转换为文本节点。
 * 与原项目 svelte-exmarkdown（allowDangerousHtml + raw 节点按转义文本输出）行为保持一致。
 */
function htmlToText() {
	return (tree) => {
		(function walk(node) {
			if (!node || !node.children) return;
			node.children = node.children.flatMap((child) => {
				if (child.type === 'html') {
					return [{ type: 'text', value: child.value }];
				}
				walk(child);
				return [child];
			});
		})(tree);
	};
}

/**
 * 根据文档名返回需要加载的 shiki 语言（动态 import 的 Promise 数组），
 * 与原项目 getLangs 行为一致（shiki 支持懒加载）。
 */
function getLangs(docName) {
	const langs = [];
	if (docName.match(/powershell/i)) {
		langs.push(import('shiki/langs/powershell.mjs'));
	}
	if (docName.match(/rust/i)) {
		langs.push(import('shiki/langs/rust.mjs'));
	}
	if (docName.match(/web/i)) {
		langs.push(
			import('shiki/langs/javascript.mjs'),
			import('shiki/langs/html.mjs'),
			import('shiki/langs/css.mjs')
		);
	}
	return langs;
}

/**
 * 文档正文渲染，对应原项目 src/routes/docs/[...docs]/+page.svelte。
 */
export default function DocArticle({ content, docName }) {
	const [shikiPlugin, setShikiPlugin] = useState(null);
	const [shikiFailed, setShikiFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;

		createHighlighterCore({
			themes: [import('shiki/themes/slack-dark.mjs'), import('shiki/themes/slack-ochin.mjs')],
			langs: getLangs(docName),
			engine: createOnigurumaEngine(import('shiki/wasm'))
		})
			.then((highlighter) => {
				if (cancelled) return;
				setShikiPlugin({
					rehypePlugin: [rehypeShikiFromHighlighter, highlighter, { themes: { light: 'slack-ochin', dark: 'slack-dark' } }]
				});
			})
			.catch(() => {
				if (!cancelled) setShikiFailed(true);
			});

		return () => {
			cancelled = true;
		};
	}, [docName]);

	const rehypePlugins = [
		rehypeSlug,
		[
			rehypeToc,
			{
				headings: ['h2', 'h3', 'h4', 'h5', 'h6'],
				cssClasses: {
					toc: MD.navFlagClass
				}
			}
		],
		...(shikiPlugin ? [shikiPlugin.rehypePlugin] : [])
	];

	const remarkPlugins = [remarkGfm, htmlToText];

	const components = {
		pre: MD.Pre,
		nav: MD.Nav,
		h1: MD.h1,
		h2: MD.h2,
		h3: MD.h3,
		h4: MD.h4,
		h5: MD.h5,
		h6: MD.h6
	};

	return (
		<div className="doc-container">
			<article className="prose dark:prose-invert">
				<ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>
					{content}
				</ReactMarkdown>
			</article>
			<div className="toc-holder" aria-hidden="true"></div>
		</div>
	);
}
