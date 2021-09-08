import { defineConfig } from '@vitebook/core';
import { vueClientPlugin } from '@vitebook/vue';
import { vueMarkdownPlugin } from '@vitebook/plugin-markdown-vue';
import { storyPlugin } from '@vitebook/plugin-story';

export default defineConfig({
  include: ['src/**/*.{md,vue}'],
  site: {
    locales: {
      '/zh': {
        lang: 'Chinese'
      }
    }
  },
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
