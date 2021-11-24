import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { preactMarkdownPlugin } from '@vitebook/markdown-preact/node';
import { preactPlugin } from '@vitebook/preact/node'; /** __IMPORTS__ */

export default defineConfig(/** __GENERICS__ */)({
  include: ['src/**/*.{md,jsx,tsx}'],
  plugins: [
    preactMarkdownPlugin(),
    preactPlugin({
      appFile: 'App.tsx',
      preact: { include: /\.([j|t]sx?|md)$/ },
    }),
    clientPlugin() /** __PLUGINS__ */,
  ],
  site: {
    title: '__SITE_NAME__',
    description: '__SITE_DESCRIPTION__',
    /** __THEME_TYPE__  */ theme: {},
  },
});
