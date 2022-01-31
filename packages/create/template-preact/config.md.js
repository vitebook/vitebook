import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { preactMarkdownPlugin } from '@vitebook/markdown-preact/node';
import { preactPlugin } from '@vitebook/preact/node'; /** __IMPORTS__ */

export default defineConfig(/** __GENERICS__ */)({
  include: ['src/**/*.md', 'src/**/*.story.{jsx,tsx}'],
  plugins: [
    preactMarkdownPlugin(),
    preactPlugin({ appFile: 'App.tsx' }),
    clientPlugin() /** __PLUGINS__ */,
  ],
  site: {
    title: '__SITE_NAME__',
    description: '__SITE_DESCRIPTION__',
    /** __THEME_TYPE__  */ theme: {},
  },
});
