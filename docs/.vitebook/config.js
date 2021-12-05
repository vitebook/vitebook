// @ts-check

import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { svelteMarkdownPlugin } from '@vitebook/markdown-svelte/node';
import { defaultThemePlugin } from '@vitebook/theme-default/node';
import { shikiMarkdownPlugin } from '@vitebook/markdown-shiki/node';

export default defineConfig({
  include: ['src/**/*.md'],
  plugins: [
    svelteMarkdownPlugin(),
    shikiMarkdownPlugin(),
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
      sidebar: {
        style: 'docs',
        categories: true,
      },
      markdown: {
        toc: true,
        editLink: true,
        editLinkText: 'Edit this page on GitHub',
        prevLink: true,
        nextLink: true,
        lastUpdated: true,
        remoteGitRepo: {
          dir: 'docs',
        },
      },
      remoteGitRepo: {
        url: 'vitebook/vitebook',
      },
    },
  },
});
