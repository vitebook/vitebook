import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { ClientPlugin, Plugin } from '@vitebook/core';
import createVuePlugin, {
  Options as VuePluginOptions
} from '@vitejs/plugin-vue';

export type VueClientPluginOptions = {
  /**
   * Filter out which files to be included as vue pages.
   *
   * @default undefined
   */
  pages?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as vue pages.
   *
   * @default undefined
   */
  pagesExclude?: FilterPattern;

  /**
   * `@vitejs/plugin-vue` plugin options.
   */
  vue?: VuePluginOptions;
};

export const PLUGIN_NAME = 'vitebook/vue' as const;

export function vueClientPlugin(
  options: VueClientPluginOptions = {}
): [ClientPlugin, Plugin] {
  const pagesFilter = createFilter(options.pages, options.pagesExclude);

  const theme = {
    pkg: '@vitebook/theme-vue-default',
    path: ''
  };

  try {
    theme.path = require.resolve(theme.pkg + '/client');
  } catch (e) {
    /** no-op */
  }

  return [
    {
      name: PLUGIN_NAME,
      entry: {
        client: require.resolve(`@${PLUGIN_NAME}/client/entry-client.ts`),
        server: require.resolve(`@${PLUGIN_NAME}/client/entry-server.ts`)
      },
      theme,
      config() {
        return {
          optimizeDeps: {
            // Force include `vue` to avoid duplicated copies when linked + optimized.
            include: ['vue', 'vue-router', 'quicklink']
          }
        };
      },
      async resolvePage({ filePath }) {
        if (pagesFilter(filePath)) {
          return {
            type: 'vue'
          };
        }

        return null;
      }
    },
    createVuePlugin(options.vue)
  ];
}
