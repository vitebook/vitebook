import { defineConfig } from '@vitebook/core/node';
import { clientPlugin } from '@vitebook/client/node';
import { vueMarkdownPlugin } from '@vitebook/plugin-markdown-vue/node';
import { shikiMarkdownPlugin } from '@vitebook/plugin-markdown-shiki/node';
import type { DefaultThemeConfig } from '@vitebook/theme-default/node';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.{md,vue}'],
  plugins: [
    shikiMarkdownPlugin(),
    vueMarkdownPlugin({
      include: /\.md/
    }),
    clientPlugin({
      include: /\.(md|vue)/
    })
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
