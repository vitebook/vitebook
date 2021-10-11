import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { ClientPlugin, Plugin } from '@vitebook/core/node';
import { fs, path } from '@vitebook/core/node/utils';
import createVuePlugin, {
  Options as VuePluginOptions
} from '@vitejs/plugin-vue';

import type { PageAddonPlugin, PageAddons } from '../shared';
import {
  loadAddonsVirtualModule,
  VIRTUAL_ADDONS_MODULE_ID,
  VIRTUAL_ADDONS_MODULE_REQUEST_PATH
} from './addon';
import { compileHTML } from './compilers/compileHTML';

export type ClientPluginOptions = {
  /**
   * Page addon plugins.
   */
  addons?: PageAddons[];

  /**
   * Filter out which files to be included as pages.
   *
   * @default  /\.(html|vue)($|\?)/
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
   *
   * @link https://github.com/vitejs/vite/tree/main/packages/plugin-vue
   */
  vue?: VuePluginOptions;
};

const SVG_ID_RE = /\.svg/;
const RAW_ID_RE = /(\?raw&vue|&raw&vue)/;

export const DEFAULT_INCLUDE_RE = /\.(html|vue)($|\?)/;

export const PLUGIN_NAME = '@vitebook/client' as const;

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

  /** Page system file paths. */
  const files = new Set<string>();

  const vuePlugin = createVuePlugin({
    ...options.vue,
    include:
      options.vue?.include ??
      (options.include as string[]) ??
      DEFAULT_INCLUDE_RE
  }) as Plugin;

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
          },
          optimizeDeps: {
            // Force include `vue` to avoid duplicated copies when linked + optimized.
            include: ['vue']
          }
        };
      },
      async resolvePage({ filePath }) {
        if (filter(filePath)) {
          files.add(filePath);
          const type = path.extname(filePath).slice(1);
          return {
            type: type === 'vue' ? 'vue' : `vue:${type}`
          };
        }

        return null;
      },
      pagesRemoved(pages) {
        pages.forEach(({ filePath }) => {
          files.delete(filePath);
        });
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
      async transform(code, id) {
        // Transform raw SVG's into Vue components.
        if (SVG_ID_RE.test(id) && RAW_ID_RE.test(id)) {
          const content = JSON.parse(code.replace('export default', ''));
          return compileHTML(content, id);
        }

        if (files.has(id) && SVG_ID_RE.test(id)) {
          const content = (await fs.readFile(id)).toString();
          return svgToVue(content);
        }

        return null;
      },
      async handleHotUpdate(ctx) {
        const { file, read } = ctx;

        // Hot reload `.svg` files as `.vue` files.
        if (files.has(file) && SVG_ID_RE.test(file)) {
          const content = await read();
          return vuePlugin.handleHotUpdate?.({
            ...ctx,
            read: () => svgToVue(content)
          });
        }
      }
    },
    ...filteredAddons,
    vuePlugin
  ];
}

function svgToVue(svg: string): string {
  return `<template>${svg}</template><script>export default {}</script>`;
}
