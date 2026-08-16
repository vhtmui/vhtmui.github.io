import { Button } from '@ui/button.jsx';
import { formatUrl } from '@lib/my-utils.js';

/** 对应原项目 src/routes/+page.svelte */
const className =
	'text-2xl font-bold grow min-w-50 max-w-1/1 h-50 flex items-center justify-center whitespace-normal text-center';
const variant = 'outline';

export default function Home() {
	return (
		<div className="flex min-h-screen w-full flex-wrap items-start gap-8 p-10">
			<Button variant={variant} className={className} href={formatUrl('/mac-converter')}>
				MAC Address Converter
			</Button>
			<Button variant={variant} className={className} href={formatUrl('/dufs')}>
				Dufs
			</Button>
			<Button variant={variant} className={className} href={formatUrl('/docs')}>
				Docs
			</Button>
			<Button variant={variant} className={className} href={formatUrl('/testpage')}>
				Test Page
			</Button>
		</div>
	);
}
