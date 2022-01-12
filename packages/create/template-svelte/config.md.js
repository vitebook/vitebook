import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { svelteMarkdownPlugin } from '@vitebook/markdown-svelte/node'; /** __IMPORTS__ */

export default defineConfig(/** __GENERICS__ */)({
  include: ['src/**/*.{md,svelte}'],
  plugins: [
    svelteMarkdownPlugin(),
    clientPlugin({
      appFile: 'App.svelte',
      svelte: {
        extensions: ['.svelte', '.md'],
        // Remove if using `svelte-preprocess`.
        useVitePreprocess: true,
      },
    }) /** __PLUGINS__ */,
  ],
  site: {
    title: '__SITE_NAME__',
    description: '__SITE_DESCRIPTION__',
    /** __THEME_TYPE__  */ theme: {},
  },
});
