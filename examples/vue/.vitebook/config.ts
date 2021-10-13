import { defineConfig, clientPlugin } from '@vitebook/client/node';
import { vueMarkdownPlugin } from '@vitebook/markdown-vue/node';
import { shikiMarkdownPlugin } from '@vitebook/markdown-shiki/node';
import {
  DefaultThemeConfig,
  defaultThemePlugin
} from '@vitebook/theme-default/node';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.{md,vue}'],
  plugins: [
    shikiMarkdownPlugin(),
    vueMarkdownPlugin({
      include: /\.md/
    }),
    clientPlugin({
      include: /\.(md|vue)/
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
