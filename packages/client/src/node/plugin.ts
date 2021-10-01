import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { App, ClientPlugin, Plugin } from '@vitebook/core/node';
import { esmRequire, fs, loadModule, path } from '@vitebook/core/node/utils';
import { isArray } from '@vitebook/core/shared';
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
   * @default  /\.(html|svg|vue)($|\?)/
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

const MARKDOWN_ID_RE = /\.md($|\?)/;
const SVG_ID_RE = /\.svg/;
const RAW_ID_RE = /(\?raw&vue|&raw&vue)/;

export const DEFAULT_INCLUDE_RE = /\.(html|svg|vue)($|\?)/;

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
            include: ['vue', 'vue-router', 'vue-shadow-dom', 'quicklink']
          }
        };
      },
      async configureApp(app) {
        await attemptToAutoLoadDefaultTheme(app);
      },
      async resolvePage({ filePath }) {
        if (filter(filePath)) {
          files.add(filePath);
          return {
            // strip `.`
            type: path.extname(filePath).slice(1)
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

export const withIncludeMarkdown = (
  include: FilterPattern = DEFAULT_INCLUDE_RE
): FilterPattern => [
  ...(isArray(include) ? (include as string[]) : [include as string]),
  MARKDOWN_ID_RE
];

/**
 * Attempt to automatically add default theme plugin if missing.
 */
async function attemptToAutoLoadDefaultTheme(app: App) {
  const defaultThemePluginNameRE = /@vitebook\/theme-default/;

  const themePlugin = app.plugins.some((plugin) =>
    defaultThemePluginNameRE.test(plugin.name)
  );

  if (!themePlugin) {
    try {
      const path = await esmRequire.resolve('@vitebook/theme-default/node');
      if (!path) return;

      const mod = await loadModule<{
        defaultThemePlugin: () => Plugin;
      }>(path, {
        outdir: app.dirs.tmp.path
      });

      const plugin = mod.defaultThemePlugin();
      app.plugins.push(plugin);
      await plugin.configureApp?.(app, app.env);
    } catch (e) {
      //
    }
  }
}
