import {
  clientPlugin,
  defineConfig,
} from '@vitebook/client/node'; /** __IMPORTS__ */

export default defineConfig(/** __GENERICS__ */)({
  include: ['src/**/*.svelte'],
  plugins: [clientPlugin({ appFile: 'App.svelte' }) /** __PLUGINS__ */],
  site: {
    title: '__SITE_NAME__',
    description: '__SITE_DESCRIPTION__',
    /** __THEME_TYPE__  */ theme: {},
  },
});
