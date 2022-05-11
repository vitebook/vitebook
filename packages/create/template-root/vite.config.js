import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from '@vitebook/core/node';

export default defineConfig({
  // Vitebook configuration.
  book: {},

  plugins: [
    svelte({
      extensions: ['.svelte', '.md'],
      compilerOptions: {
        hydratable: true,
      },
    }),
  ],
});
