import preact from '@preact/preset-vite';
import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { preactMarkdownPlugin } from '@vitebook/markdown-preact/node';
import { preactPlugin } from '@vitebook/preact/node';
import { defaultThemePlugin } from '@vitebook/theme-default/node';

export default defineConfig({
  include: ['src/**/*.{md,jsx}'],
  plugins: [
    preactMarkdownPlugin(),
    preactPlugin({ appFile: 'App.jsx' }),
    clientPlugin(),
    defaultThemePlugin(),
    preact({ include: /\.(jsx?|md)$/ }),
  ],
  site: {
    title: 'Preact Js',
    description: '',
    /** @type {(import('@vitebook/theme-default/node').DefaultThemeConfig} */
    theme: {},
  },
});
