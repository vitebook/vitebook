import { defineConfig, clientPlugin } from '@vitebook/client/node';
import { svelteMarkdownPlugin } from '@vitebook/markdown-svelte/node';
import { shikiMarkdownPlugin } from '@vitebook/markdown-shiki/node';
import {
  DefaultThemeConfig,
  defaultThemePlugin
} from '@vitebook/theme-default/node';
import sveltePreprocess from 'svelte-preprocess';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.{md,svelte}'],
  plugins: [
    shikiMarkdownPlugin(),
    svelteMarkdownPlugin({
      include: /\.md/
    }),
    clientPlugin({
      include: /\.(md|svelte)/,
      svelte: {
        preprocess: [sveltePreprocess({ typescript: true })],
        extensions: ['.svelte', '.md']
      }
    }),
    defaultThemePlugin()
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
