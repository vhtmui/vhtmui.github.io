import { forwardRef } from 'react';
import { cn } from '../../utils.js';
import { Input } from './input.jsx';

/** 对应原项目 src/lib/components/ui/input-group 系列组件 */
const InputGroup = forwardRef(function InputGroup({ className, children, ...props }, ref) {
	return (
		<div
			ref={ref}
			data-slot="input-group"
			role="group"
			className={cn(
				'group/input-group border-input dark:bg-input/30 relative flex w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none',
				'h-9 has-[>textarea]:h-auto',

				// Variants based on alignment.
				'has-[>[data-align=inline-start]]:[&>input]:ps-2',
				'has-[>[data-align=inline-end]]:[&>input]:pe-2',
				'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3',
				'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3',

				// Focus state.
				'has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]',

				// Error state.
				'has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40',

				className
			)}
			{...props}
		>
			{children}
		</div>
	);
});

const InputGroupInput = forwardRef(function InputGroupInput({ className, ...props }, ref) {
	return (
		<Input
			ref={ref}
			data-slot="input-group-control"
			className={cn(
				'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent',
				className
			)}
			{...props}
		/>
	);
});

const inputGroupAddonVariants = {
	base: 'text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*="size-"])]:size-4',
	align: {
		'inline-start': 'order-first ps-3 has-[>button]:ms-[-0.45rem] has-[>kbd]:ms-[-0.35rem]',
		'inline-end': 'order-last pe-3 has-[>button]:me-[-0.45rem] has-[>kbd]:me-[-0.35rem]',
		'block-start':
			'order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3',
		'block-end':
			'order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3'
	}
};

const InputGroupAddon = forwardRef(function InputGroupAddon(
	{ className, align = 'inline-start', children, onClick, ...restProps },
	ref
) {
	return (
		<div
			ref={ref}
			role="group"
			data-slot="input-group-addon"
			data-align={align}
			className={cn(
				inputGroupAddonVariants.base,
				inputGroupAddonVariants.align[align],
				className
			)}
			onClick={(e) => {
				if (e.target.closest('button')) {
					return;
				}
				e.currentTarget.parentElement?.querySelector('input')?.focus();
				onClick?.(e);
			}}
			{...restProps}
		>
			{children}
		</div>
	);
});

const InputGroupButton = forwardRef(function InputGroupButton({ className, ...props }, ref) {
	return <div ref={ref} data-slot="input-group-button" className={className} {...props} />;
});

const InputGroupText = forwardRef(function InputGroupText({ className, ...props }, ref) {
	return <div ref={ref} data-slot="input-group-text" className={className} {...props} />;
});

const InputGroupTextarea = forwardRef(function InputGroupTextarea({ className, ...props }, ref) {
	return <textarea ref={ref} data-slot="input-group-control" className={className} {...props} />;
});

export {
	InputGroup,
	InputGroupInput,
	InputGroupAddon,
	InputGroupButton,
	InputGroupText,
	InputGroupTextarea,
	//
	InputGroup as Root,
	InputGroupInput as Input,
	InputGroupAddon as Addon,
	InputGroupButton as Button,
	InputGroupText as Text,
	InputGroupTextarea as Textarea
};
