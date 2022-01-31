import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { preactPlugin } from '@vitebook/preact/node'; /** __IMPORTS__ */

export default defineConfig(/** __GENERICS__ */)({
  include: ['src/**/*.story.{jsx,tsx}'],
  plugins: [
    preactPlugin({ appFile: 'App.tsx' }),
    clientPlugin() /** __PLUGINS__ */,
  ],
  site: {
    title: '__SITE_NAME__',
    description: '__SITE_DESCRIPTION__',
    /** __THEME_TYPE__  */ theme: {},
  },
});
