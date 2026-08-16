import { Fragment } from 'react';
import { cn } from '@lib/utils.js';

export const navFlagClass = 'vvvvvvvvvvvh';

/**
 * 递归渲染 hast 节点，对应原项目 Nav.svelte 中的 node snippet。
 * @param {any} child - hast 节点
 */
function renderNode(child) {
	if (child.type === 'element') {
		const { className, ...restProps } = child.properties || {};
		const isTopLevel = className?.includes('toc-level-1');
		const csn = cn(className, isTopLevel ? 'menu' : '');
		const Tag = child.tagName === 'ol' ? 'ul' : child.tagName;
		const kids = [];

		if (isTopLevel) {
			kids.push(
				<li key="title" className="menu-title">
					OutLine
				</li>
			);
		}

		if (child.tagName === 'li') {
			if (child.children.length > 1) {
				kids.push(
					<details key="details">
						<summary>{renderNode(child.children[0])}</summary>
						{child.children.slice(1).map((c, i) => (
							<Fragment key={i}>{renderNode(c)}</Fragment>
						))}
					</details>
				);
			} else if (child.children.length === 1) {
				kids.push(<Fragment key="single">{renderNode(child.children[0])}</Fragment>);
			}
		} else {
			child.children.forEach((c, i) => kids.push(<Fragment key={i}>{renderNode(c)}</Fragment>));
		}

		return (
			<Tag className={csn} {...restProps}>
				{kids}
			</Tag>
		);
	}
	if (child.type === 'text' || child.type === 'raw') {
		return child.value;
	}
	return null;
}

/**
 * 对应原项目 src/routes/docs/MyMarkdown/Nav.svelte。
 * 仅对 rehype-toc 生成的 nav（class 含 navFlagClass）做自定义渲染，
 * 其他 nav 直接渲染其子内容。
 */
export default function Nav({ node, className: ClassName, children, ...restProps }) {
	const navAst = node;

	if (!navAst?.properties?.className?.includes(navFlagClass)) {
		return <>{children}</>;
	}

	return (
		<nav className={cn('not-prose md-nav', ClassName, navAst.properties.className)} {...restProps}>
			{navAst.children.map((child, i) => (
				<Fragment key={i}>{renderNode(child)}</Fragment>
			))}
		</nav>
	);
}
