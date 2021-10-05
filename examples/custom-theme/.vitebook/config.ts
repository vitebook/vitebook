import { defineConfig, clientPlugin } from '@vitebook/client/node';

export default defineConfig({
  include: ['src/**/*.vue'],
  plugins: [
    clientPlugin({
      include: /\.(vue)/
    })
  ],
  site: {
    title: 'Vitebook',
    description: 'Blazing fast Storybook alternative.'
  }
});
