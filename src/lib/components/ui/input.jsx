import { forwardRef } from 'react';
import { cn } from '../../utils.js';

/** 对应原项目 src/lib/components/ui/input/input.svelte（非 file 分支） */
const Input = forwardRef(function Input({ className, type, ...props }, ref) {
	return (
		<input
			type={type}
			ref={ref}
			data-slot="input"
			className={cn(
				'border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
				'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
				className
			)}
			{...props}
		/>
	);
});

export { Input };
export default Input;
