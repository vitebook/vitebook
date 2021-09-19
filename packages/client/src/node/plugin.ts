import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { ClientPlugin, Plugin } from '@vitebook/core/node';
import createVuePlugin, {
  Options as VuePluginOptions
} from '@vitejs/plugin-vue';

export type ClientPluginOptions = {
  /**
   * Filter out which files to be included as pages.
   *
   * @default undefined
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as pages.
   *
   * @default undefined
   */
  exclude?: FilterPattern;

  /**
   * `@vitejs/plugin-vue` plugin options.
   */
  vue?: VuePluginOptions;
};

export const PLUGIN_NAME = 'vitebook/client' as const;

export function clientPlugin(
  options: ClientPluginOptions = {}
): [ClientPlugin, Plugin] {
  const filter = createFilter(options.include, options.exclude);

  return [
    {
      name: PLUGIN_NAME,
      entry: {
        client: require.resolve(`@${PLUGIN_NAME}/entry-client.ts`),
        server: require.resolve(`@${PLUGIN_NAME}/entry-server.ts`)
      },
      config() {
        return {
          optimizeDeps: {
            // Force include `vue` to avoid duplicated copies when linked + optimized.
            include: ['vue', 'vue-router', 'quicklink']
          }
        };
      },
      async resolvePage({ filePath }) {
        if (filter(filePath)) {
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
