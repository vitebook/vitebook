import { createFilter, FilterPattern } from '@rollup/pluginutils';
import { Options as SvelteOptions, svelte } from '@sveltejs/vite-plugin-svelte';
import type { ClientPlugin, Plugin } from '@vitebook/core/node';
import { compile as svelteCompile } from 'svelte/compiler';

import type { PageAddonPlugin, PageAddons } from '../shared';
import {
  loadAddonsVirtualModule,
  VIRTUAL_ADDONS_MODULE_ID,
  VIRTUAL_ADDONS_MODULE_REQUEST_PATH
} from './addon';

export const PLUGIN_NAME = '@vitebook/client' as const;

export type ClientPluginOptions = {
  /**
   * Page addon plugins.
   */
  addons?: PageAddons[];

  /**
   * Filter out which files to be included as svelte pages.
   *
   * @default /\.svelte($|\?)/
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as svelte pages.
   *
   * @default undefined
   */
  exclude?: FilterPattern;

  /**
   * `@sveltejs/vite-plugin-svelte` plugin options.
   *
   * @link https://github.com/sveltejs/vite-plugin-svelte
   */
  svelte?: SvelteOptions;
};

const DEFAULT_INCLUDE_RE = /\.svelte($|\?)/;

const SVG_ID_RE = /\.svg/;
const RAW_ID_RE = /(\?raw&svelte|&raw&svelte)/;

export function clientPlugin(
  options: ClientPluginOptions = {}
): [ClientPlugin, ...Plugin[]] {
  const filter = createFilter(
    options.include ?? DEFAULT_INCLUDE_RE,
    options.exclude
  );

  const filteredAddons = (options.addons ?? [])
    .flat()
    .filter((addon) => !!addon) as PageAddonPlugin[];

  const sveltePlugin = svelte(options.svelte);

  return [
    {
      name: PLUGIN_NAME,
      enforce: 'pre',
      entry: {
        client: require.resolve(`${PLUGIN_NAME}/entry-client.ts`),
        server: require.resolve(`${PLUGIN_NAME}/entry-server.ts`)
      },
      config() {
        return {
          resolve: {
            alias: {
              [VIRTUAL_ADDONS_MODULE_ID]: VIRTUAL_ADDONS_MODULE_REQUEST_PATH
            }
          }
        };
      },
      resolvePage({ filePath }) {
        if (filter(filePath)) {
          return {
            type: 'svelte'
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
      },
      transform(code, id) {
        // Transform raw SVG's into Svelte components.
        if (SVG_ID_RE.test(id) && RAW_ID_RE.test(id)) {
          const content = JSON.parse(code.replace('export default', ''));
          return svelteCompile(content).js;
        }

        return null;
      }
    },
    ...filteredAddons,
    sveltePlugin
  ];
}
