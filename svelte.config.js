import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: false,
			precompress: false,
			strict: true
		}),
		prerender: {
			//忽略检查
			handleHttpError: 'ignore',
			handleMissingId: 'ignore'
		}
	}
};