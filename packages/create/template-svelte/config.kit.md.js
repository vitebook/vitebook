import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteMarkdownPlugin } from '@vitebook/markdown-svelte/node';
import { clientPlugin, defineConfig } from '@vitebook/client/node'; /** __IMPORTS__ */
import preprocess from 'svelte-preprocess';

export default defineConfig(/** __GENERICS__ */)({
  include: ['src/**/*.md', 'src/**/*.story.svelte'] /** __CONFIG__ */,
  alias: {
    $app: '/.svelte-kit/runtime/app',
    $lib: '/src/lib',
  },
  plugins: [
    svelteMarkdownPlugin(),
    clientPlugin({ appFile: 'App.svelte' }) /** __PLUGINS__ */,
    svelte({
      compilerOptions: {
        hydratable: true
      },
      extensions: ['.md', '.svelte'],
      // Consult https://github.com/sveltejs/svelte-preprocess for more information
      // about preprocessors.
      preprocess: preprocess(),
    }),
  ],
  site: {
    title: '__SITE_NAME__',
    description: '__SITE_DESCRIPTION__',
    /** __THEME_TYPE__  */ theme: {},
  },
});
