import { svelte } from '@sveltejs/vite-plugin-svelte';
import { clientPlugin, defineConfig } from '@vitebook/client/node'; /** __IMPORTS__ */
import preprocess from 'svelte-preprocess';

export default defineConfig(/** __GENERICS__ */)({
  include: ['src/**/*.story.svelte'], /** __CONFIG__ */
  alias: {
    $app: '/node_modules/@sveltejs/kit/assets/app',
    $lib: '/src/lib',
  },
  plugins: [
    clientPlugin({ appFile: 'App.svelte' }) /** __PLUGINS__ */,
    svelte({
      compilerOptions: {
        hydratable: true
      },
      extensions: ['.svelte'],
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
