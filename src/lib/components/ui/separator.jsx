import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '../../utils.js';

/** 对应原项目 src/lib/components/ui/separator/separator.svelte */
function Separator({ className, orientation = 'horizontal', decorative = true, ...props }) {
	return (
		<SeparatorPrimitive.Root
			decorative={decorative}
			orientation={orientation}
			data-slot="separator"
			className={cn(
				'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:min-h-full data-[orientation=vertical]:w-px',
				className
			)}
			{...props}
		/>
	);
}

export { Separator };
export default Separator;
