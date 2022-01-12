import { defineConfig, clientPlugin } from '@vitebook/client/node';
import {
  DefaultThemeConfig,
  defaultThemePlugin,
} from '@vitebook/theme-default/node';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.story.svelte'],
  plugins: [
    clientPlugin({
      appFile: 'App.svelte',
      svelte: {
        experimental: {
          // Remove if using `svelte-preprocess`.
          useVitePreprocess: true,
        },
      },
    }),
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
