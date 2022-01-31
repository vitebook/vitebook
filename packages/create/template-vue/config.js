import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { vuePlugin } from '@vitebook/vue/node'; /** __IMPORTS__ */

export default defineConfig(/** __GENERICS__ */)({
  include: ['src/**/*.story.vue'],
  plugins: [
    vuePlugin({ appFile: 'App.vue' }),
    clientPlugin() /** __PLUGINS__ */,
  ],
  site: {
    title: '__SITE_NAME__',
    description: '__SITE_DESCRIPTION__',
    /** __THEME_TYPE__  */ theme: {},
  },
});
