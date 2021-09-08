import { defineConfig } from '@vitebook/core';
import { vueClientPlugin } from '@vitebook/vue';
import { vueMarkdownPlugin } from '@vitebook/plugin-markdown-vue';
import { storyPlugin } from '@vitebook/plugin-story';

export default defineConfig({
  include: ['src/**/*.{md,vue}'],
  site: {
    title: 'Vitebook',
    description: 'Yessir',
    locales: {
      '/zh': {
        lang: 'Chinese',
        description: 'My Site'
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
