import { defineConfig, clientPlugin } from '@vitebook/client/node';
import { sveltePlugin } from '@vitebook/plugin-svelte/node';
import { svelteMarkdownPlugin } from '@vitebook/plugin-markdown-svelte/node';
import { shikiMarkdownPlugin } from '@vitebook/plugin-markdown-shiki/node';
import type { DefaultThemeConfig } from '@vitebook/theme-default/node';
import sveltePreprocess from 'svelte-preprocess';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.{md,svelte}'],
  plugins: [
    shikiMarkdownPlugin(),
    svelteMarkdownPlugin({
      include: /\.md/
    }),
    sveltePlugin({
      include: /\.(md|svelte)/,
      svelte: {
        preprocess: [sveltePreprocess({ typescript: true })],
        extensions: ['.svelte', '.md']
      }
    }),
    clientPlugin()
  ],
  site: {
    title: 'Vitebook',
    description: 'Blazing fast Storybook alternative.',
    theme: {
      remoteGitRepo: {
        url: 'vitebook/vitebook'
      }
    }
  }
});
