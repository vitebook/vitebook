import { defineConfig, clientPlugin } from '@vitebook/client/node';
import { svelteMarkdownPlugin } from '@vitebook/markdown-svelte/node';
import { shikiMarkdownPlugin } from '@vitebook/markdown-shiki/node';
import {
  DefaultThemeConfig,
  defaultThemePlugin
} from '@vitebook/theme-default/node';
import sveltePreprocess from 'svelte-preprocess';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.md', 'src/**/*.story.svelte'],
  plugins: [
    shikiMarkdownPlugin(),
    svelteMarkdownPlugin({
      include: /\.md/
    }),
    clientPlugin({
      include: /\.(md|svelte)/,
      svelte: {
        extensions: ['.svelte', '.md'],
        preprocess: [
          sveltePreprocess({
            // Vitebook internally handles preprocessing typescript with `esbuild`.
            typescript: false
          })
        ]
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
