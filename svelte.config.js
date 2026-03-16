import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			// default options are shown
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		alias: { '@ui/*': 'src/lib/components/ui/*' },
		prerender: {
			handleHttpError: ({ path, message }) => {
				// ignore deliberate link to shiny 404 page
				if (path === '/dufs' || path === '/programming' || path.startsWith('/docs/')) {
					return;
				}

				// otherwise fail the build
				throw new Error(message);
			},
			handleMissingId: 'warn'
		},
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		}
	}
};

export default config;
