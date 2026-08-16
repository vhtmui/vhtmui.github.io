import { ChevronLeft } from 'lucide-react';
import { cn } from '@lib/utils.js';
import { useSidebar } from '@ui/sidebar.jsx';
import CsButton from '../CsButton.jsx';

/** 对应原项目 src/lib/components/my/GlobalSidebar/CsSidebarTrigger.svelte */
export default function CsSidebarTrigger({ className, hidden, ...restProps }) {
	const sidebar = useSidebar();
	return (
		<CsButton className={cn('', className)} onClick={sidebar.toggleSidebar} hidden={hidden} {...restProps}>
			<ChevronLeft />
		</CsButton>
	);
}
