import { Button } from '@ui/button.jsx';

/** 对应原项目 src/routes/+error.svelte */
export default function NotFound({ status = 404, message = 'Not Found' }) {
	return (
		<div className="flex h-[80vh] flex-col items-center justify-center gap-4">
			<h1>
				{status}: {message}
			</h1>
			<Button onClick={() => window.history.back()} size="lg" variant="outline">
				Back
			</Button>
		</div>
	);
}
