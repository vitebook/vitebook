import { defineConfig, clientPlugin } from '@vitebook/client/node';

export default defineConfig({
  include: ['src/**/*.svelte'],
  plugins: [
    clientPlugin({
      include: /\.svelte/,
    }),
  ],
  site: {
    title: 'Vitebook',
    description: 'Blazing fast Storybook alternative.',
  },
});
