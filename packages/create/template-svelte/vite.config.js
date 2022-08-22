import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vitebook } from '@vitebook/core/node';
import { vitebookSvelte } from '@vitebook/svelte/node';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    vitebook(),
    vitebookSvelte(),
    svelte({
      extensions: ['.svelte', '.md'],
      compilerOptions: {
        hydratable: true,
      },
    }),
  ],
});
