import { defineConfig } from '@vitebook/core';
import { markdownVuePlugin } from '@vitebook/plugin-markdown-vue';

export default defineConfig({
  pages: ['**/*.md'],
  plugins: [markdownVuePlugin()]
});
