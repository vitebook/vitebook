import { defineConfig } from '@vitebook/core';
import { vueClientPlugin } from '@vitebook/plugin-client-vue';
import { vueMarkdownPlugin } from '@vitebook/plugin-markdown-vue';
import { storyPlugin } from '@vitebook/plugin-story';

export default defineConfig({
  include: ['src/**/*.{md,vue}'],
  plugins: [
    vueMarkdownPlugin({
      pages: /.md$/
    }),
    storyPlugin({
      pages: /\.(story\.)?vue$/
    }),
    vueClientPlugin({
      // pages: /\.vue$/,
      vue: {
        include: [/\.vue$/, /\.md$/]
      }
    })
  ]
});
