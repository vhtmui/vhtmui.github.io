import ThemeToggle from './ThemeToggle.jsx';
import Navigator from './Navigator.jsx';

/** 对应原项目 src/lib/components/my/Header.svelte */
export default function Header({ top = 0 }) {
	return (
		<header
			className="bg-background fixed z-11 flex h-14 flex-row items-center gap-2 border-b pr-2 pl-2"
			style={{ top: `${top}px`, width: '100%' }}
		>
			<Navigator />
			<ThemeToggle />
		</header>
	);
}
