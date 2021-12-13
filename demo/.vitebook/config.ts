import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { vueMarkdownPlugin } from '@vitebook/markdown-vue/node';
import { vuePlugin } from '@vitebook/vue/node';
import { shikiMarkdownPlugin } from '@vitebook/markdown-shiki/node';
import {
  defaultThemePlugin,
  DefaultThemeConfig,
} from '@vitebook/theme-default/node';
import styleImport from 'vite-plugin-style-import';

export default defineConfig<DefaultThemeConfig>({
  include: ['src/**/*.md', 'src/**/*.story.vue'],
  plugins: [
    shikiMarkdownPlugin(),
    vueMarkdownPlugin({
      code: {
        lineNumbers: false,
      },
      links: {
        externalIcon: false,
      },
    }),
    vuePlugin({
      appFile: 'App.vue',
      vue: { include: /\.(md|vue)/ },
    }),
    clientPlugin(),
    defaultThemePlugin(),
    // @ts-expect-error - .
    styleImport.default({
      libs: [
        {
          libraryName: 'vant',
          esModule: true,
          resolveStyle: (name) => `vant/es/${name}/style/index`,
        },
      ],
    }) as typeof styleImport,
  ],
  vite: {
    optimizeDeps: {
      exclude: ['vant'],
    },
  },
  site: {
    title: 'Vitebook Demo',
    description: 'A Vitebook demo using Vant.',
    theme: {
      markdown: {
        toc: true,
        prevLink: true,
        nextLink: true,
        lastUpdated: true,
        editLink: true,
        remoteGitRepo: {
          dir: 'demo',
        },
      },
      remoteGitRepo: {
        url: 'vitebook/vitebook',
      },
      sidebar: {
        categories: true,
        style: 'explorer',
      },
    },
  },
});
