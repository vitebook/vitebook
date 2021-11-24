import { defineConfig, clientPlugin } from '@vitebook/client/node';
import { vuePlugin } from '@vitebook/vue/node';
import { vueMarkdownPlugin } from '@vitebook/markdown-vue/node';
import { shikiMarkdownPlugin } from '@vitebook/markdown-shiki/node';
import {
  DefaultThemeConfig,
  defaultThemePlugin,
} from '@vitebook/theme-default/node';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.md', 'src/**/*.story.vue'],
  plugins: [
    shikiMarkdownPlugin(),
    vueMarkdownPlugin(),
    vuePlugin({
      appFile: 'App.vue',
      vue: {
        include: /\.(md|vue)/,
      },
    }),
    clientPlugin(),
    defaultThemePlugin(),
  ],
  site: {
    title: 'Vitebook',
    description: 'Blazing fast Storybook alternative.',
    theme: {
      remoteGitRepo: {
        url: 'vitebook/vitebook',
      },
    },
  },
});
