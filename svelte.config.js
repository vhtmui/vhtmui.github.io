import adapter from "@sveltejs/adapter-auto";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter({
      // default options are shown
      pages: "build",
      assets: "build",
      fallback: "200.html",
      precompress: false,
      strict: true,
    }),
    alias: {
      "@ui/*": "src/lib/components/ui/*",
    },
  },
};

export default config;
