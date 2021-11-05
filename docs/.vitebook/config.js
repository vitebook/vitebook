import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { svelteMarkdownPlugin } from '@vitebook/markdown-svelte/node';
import { defaultThemePlugin } from '@vitebook/theme-default/node';

export default defineConfig({
  include: ['src/**/*.md', 'src/**/*.svelte'],
  plugins: [
    svelteMarkdownPlugin({ include: /\.md/ }),
    clientPlugin({
      include: /\.svelte/,
      svelte: {
        extensions: ['.svelte', '.md'],
      },
    }),
    defaultThemePlugin(),
  ],
  site: {
    title: 'Vitebook',
    description:
      'Blazing fast static-site generator and alternative to Storybook.',
    /** @type {(import('@vitebook/theme-default/node').DefaultThemeConfig} */
    theme: {
      remoteGitRepo: {
        url: 'vitebook/vitebook',
      },
    },
  },
});
