import { defineConfig } from '@vitebook/core';
import { markdownPlugin } from '@vitebook/plugin-markdown';

export default defineConfig({
  pages: ['**/*.md'],
  plugins: [markdownPlugin()]
});
