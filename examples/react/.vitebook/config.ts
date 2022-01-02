import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { preactMarkdownPlugin } from '@vitebook/markdown-preact/node';
import { preactPlugin } from '@vitebook/preact/node';
import {
  defaultThemePlugin,
  DefaultThemeConfig,
} from '@vitebook/theme-default/node';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.{md,jsx,tsx}'],
  plugins: [
    preactMarkdownPlugin(),
    preactPlugin({
      appFile: 'App.tsx',
      preact: { include: /\.([j|t]sx?|md)$/ },
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
