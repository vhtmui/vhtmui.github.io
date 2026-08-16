import { cn } from '../../utils.js';

/** 对应原项目 src/lib/components/ui/breadcrumb 系列组件 */
function Breadcrumb({ className, ...props }) {
	return <nav data-slot="breadcrumb" className={className} aria-label="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }) {
	return (
		<ol
			data-slot="breadcrumb-list"
			className={cn(
				'text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5',
				className
			)}
			{...props}
		/>
	);
}

function BreadcrumbItem({ className, ...props }) {
	return (
		<li
			data-slot="breadcrumb-item"
			className={cn('inline-flex items-center gap-1.5', className)}
			{...props}
		/>
	);
}

function BreadcrumbLink({ className, href, ...props }) {
	return (
		<a
			data-slot="breadcrumb-link"
			className={cn('hover:text-foreground transition-colors', className)}
			href={href}
			{...props}
		/>
	);
}

function BreadcrumbPage({ className, ...props }) {
	return (
		<span
			data-slot="breadcrumb-page"
			role="link"
			aria-disabled="true"
			aria-current="page"
			className={cn('text-foreground font-normal', className)}
			{...props}
		/>
	);
}

function BreadcrumbSeparator({ className, children, ...props }) {
	return (
		<li
			data-slot="breadcrumb-separator"
			role="presentation"
			aria-hidden="true"
			className={cn('[&>svg]:size-3.5', className)}
			{...props}
		>
			{children ?? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="m9 18 6-6-6-6" />
				</svg>
			)}
		</li>
	);
}

function BreadcrumbEllipsis({ className, ...props }) {
	return (
		<span
			role="presentation"
			aria-hidden="true"
			className={cn('flex h-9 w-9 items-center justify-center', className)}
			{...props}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<circle cx="12" cy="12" r="1" />
				<circle cx="19" cy="12" r="1" />
				<circle cx="5" cy="12" r="1" />
			</svg>
			<span className="sr-only">More</span>
		</span>
	);
}

export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
	//
	Breadcrumb as Root,
	BreadcrumbList as List,
	BreadcrumbItem as Item,
	BreadcrumbLink as Link,
	BreadcrumbPage as Page,
	BreadcrumbSeparator as Separator,
	BreadcrumbEllipsis as Ellipsis
};
