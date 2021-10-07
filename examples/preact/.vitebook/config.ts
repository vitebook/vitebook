import { defineConfig, clientPlugin } from '@vitebook/client/node';
import { preactPlugin } from '@vitebook/plugin-preact/node';
import { preactMarkdownPlugin } from '@vitebook/plugin-markdown-preact/node';
import { shikiMarkdownPlugin } from '@vitebook/plugin-markdown-shiki/node';
import {
  DefaultThemeConfig,
  defaultThemePlugin
} from '@vitebook/theme-default/node';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.{md,tsx}'],
  plugins: [
    shikiMarkdownPlugin(),
    preactMarkdownPlugin(),
    preactPlugin({
      include: /\.(tsx)/
    }),
    clientPlugin(),
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
