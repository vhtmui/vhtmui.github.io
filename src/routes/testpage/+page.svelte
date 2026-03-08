<script>
	import rehypeSlug from 'rehype-slug';
	import rehypeToc from 'rehype-toc';
	import { unified } from 'unified';
	import parser from 'rehype-parse';
	import rehypeStringify from 'rehype-stringify';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	const html = `<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>`;

	unified()
		.use(parser)
		.use(rehypeSlug)
		.use(rehypeToc)
		.use(rehypeStringify)
		.process(html)
		.then((file) => {
			console.log(String(file));
		});
</script>

<h1>
	<a><svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="black" /></svg></a>rrrrrrrrrrrrr
</h1>
