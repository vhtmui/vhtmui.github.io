import { forwardRef } from 'react';
import { cn } from '@lib/utils.js';
import { Button } from '@ui/button.jsx';

/** 对应原项目 src/lib/components/my/CsButton.svelte */
const CsButton = forwardRef(function CsButton(
	{ className, variant = 'ghost', size = 'icon', href, type = 'button', disabled, children, ...restProps },
	ref
) {
	return (
		<Button
			ref={ref}
			className={cn('cursor-pointer hover:text-primary', className)}
			variant={variant}
			size={size}
			href={href}
			type={type}
			disabled={disabled}
			{...restProps}
		>
			{children}
		</Button>
	);
});

export default CsButton;
