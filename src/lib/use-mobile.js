import { useEffect, useState } from 'react';

const DEFAULT_MOBILE_BREAKPOINT = 1280;

/** 对应原项目 src/lib/hooks/is-mobile.svelte.js */
export function useIsMobile(breakpoint = DEFAULT_MOBILE_BREAKPOINT) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
		const onChange = () => setIsMobile(mql.matches);
		onChange();
		mql.addEventListener('change', onChange);
		return () => mql.removeEventListener('change', onChange);
	}, [breakpoint]);

	return isMobile;
}
