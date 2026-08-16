import { cn } from '@lib/utils.js';

/** 对应原项目 src/routes/docs/MyMarkdown/h1-6.svelte */
export function h1({ node, children, style, className, ...rest }) {
	return (
		<h1 className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', className)} style={style} {...rest}>
			{children}
		</h1>
	);
}

export function h2({ node, children, style, className, ...rest }) {
	return (
		<h2 className={cn('', className)} style={style} {...rest}>
			{children}
		</h2>
	);
}

function headingWithColor(Tag) {
	return function Heading({ node, ...props }) {
		return <Tag color="red" {...props} />;
	};
}

export const h3 = headingWithColor('h3');
export const h4 = headingWithColor('h4');
export const h5 = headingWithColor('h5');
export const h6 = headingWithColor('h6');
