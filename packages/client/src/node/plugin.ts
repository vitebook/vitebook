import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { ClientPlugin, PluginOption } from '@vitebook/core/node';
import { path } from '@vitebook/core/node/utils';
import createVuePlugin, {
  Options as VuePluginOptions
} from '@vitejs/plugin-vue';

import type { PageAddonPlugin, PageAddons } from '../shared';
import {
  loadAddonsVirtualModule,
  VIRTUAL_ADDONS_MODULE_ID,
  VIRTUAL_ADDONS_MODULE_REQUEST_PATH
} from './addon';

export type ClientPluginOptions = {
  /**
   * Page addon plugins.
   */
  addons?: PageAddons[];

  /**
   * Filter out which files to be included as pages.
   *
   * @default  /\.(html|v\.js|v\.ts|v\.tsx|vue)$/
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

// TODO: transform html
const DEFAULT_INCLUDE_RE = /\.(html|v\.js|v\.ts|v\.tsx|vue)$/;

export const PLUGIN_NAME = 'vitebook/client' as const;

export function clientPlugin(
  options: ClientPluginOptions = {}
): [ClientPlugin, ...PluginOption[]] {
  const filter = createFilter(
    options.include ?? DEFAULT_INCLUDE_RE,
    options.exclude
  );

  const filteredAddons = (options.addons ?? [])
    .flat()
    .filter((addon) => !!addon) as PageAddonPlugin[];

  return [
    {
      name: PLUGIN_NAME,
      entry: {
        client: require.resolve(`@${PLUGIN_NAME}/entry-client.ts`),
        server: require.resolve(`@${PLUGIN_NAME}/entry-server.ts`)
      },
      config() {
        return {
          resolve: {
            alias: {
              [VIRTUAL_ADDONS_MODULE_ID]: VIRTUAL_ADDONS_MODULE_REQUEST_PATH
            }
          },
          optimizeDeps: {
            // Force include `vue` to avoid duplicated copies when linked + optimized.
            include: ['vue', 'vue-router', 'vue-shadow-dom', 'quicklink']
          }
        };
      },
      async resolvePage({ filePath }) {
        if (filter(filePath)) {
          return {
            // strip `.`
            type: path.extname(filePath).slice(1)
          };
        }

        return null;
      },
      resolveId(id) {
        if (id === VIRTUAL_ADDONS_MODULE_REQUEST_PATH) {
          return id;
        }

        return null;
      },
      load(id) {
        if (id === VIRTUAL_ADDONS_MODULE_REQUEST_PATH) {
          return loadAddonsVirtualModule(filteredAddons);
        }

        return null;
      }
    },
    ...filteredAddons,
    createVuePlugin(options.vue)
  ];
}
