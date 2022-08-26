import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vitebookSvelte } from '@vitebook/svelte/node';
import { defineConfig } from 'vite';
import { vitebook } from 'vitebook/node';

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
