import { createFilter, FilterPattern } from '@rollup/pluginutils';
import {
  App,
  ensureLeadingSlash,
  Plugin,
  VM_PREFIX,
} from '@vitebook/core/node';
import { fs, path } from '@vitebook/core/node/utils';
import createVuePlugin, { Options as ViteVueOptions } from '@vitejs/plugin-vue';

import { compileHTML } from './compilers/compileHTML';

export type VuePluginOptions = {
  /**
   * Path to Vue app file. The path can be absolute or relative to `<configDir>`.
   *
   * @default undefined
   */
  appFile?: string;

  /**
   * Filter out which files to be included as vue pages.
   *
   * @default  /\.(vue)($|\?)/
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as vue pages.
   *
   * @default undefined
   */
  exclude?: FilterPattern;

  /**
   * `@vitejs/plugin-vue` plugin options.
   *
   * @link https://github.com/vitejs/vite/tree/main/packages/plugin-vue
   */
  vue?: ViteVueOptions;
};

const SVG_ID_RE = /\.svg($|\?)/;
const RAW_VUE_ID_RE = /(\?|&)raw&vue/;

export const DEFAULT_INCLUDE_RE = /\.vue($|\?)/;

export const PLUGIN_NAME = '@vitebook/client' as const;

const VIRTUAL_APP_ID = `${VM_PREFIX}/vue/app`;
const VIRTUAL_APP_REQUEST_PATH = '/' + VIRTUAL_APP_ID;

export function vuePlugin(options: VuePluginOptions = {}): Plugin[] {
  let app: App;

  const filter = createFilter(
    options.include ?? DEFAULT_INCLUDE_RE,
    options.exclude,
  );

  /** Page system file paths. */
  const files = new Set<string>();

  const vuePlugin = createVuePlugin(options.vue) as Plugin;

  return [
    {
      name: PLUGIN_NAME,
      enforce: 'pre',
      config() {
        return {
          resolve: {
            dedupe: ['vue'],
            alias: {
              [VIRTUAL_APP_ID]: VIRTUAL_APP_REQUEST_PATH,
            },
          },
          optimizeDeps: {
            // Force include `vue` to avoid duplicated copies when linked + optimized.
            include: ['vue'],
          },
        };
      },
      configureApp(_app) {
        app = _app;
      },
      async resolvePage({ filePath, relativeFilePath }) {
        if (filter(filePath)) {
          files.add(filePath);
          const type = path.extname(filePath).slice(1);
          return {
            id: '@vitebook/vue/VuePageView.svelte',
            type: type === 'vue' ? 'vue' : `vue:${type}`,
            context: {
              loader: `() => import('${ensureLeadingSlash(relativeFilePath)}')`,
            },
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
        if (id === VIRTUAL_APP_REQUEST_PATH) {
          const appFile = options.appFile;
          const path = appFile && app.dirs.config.resolve(appFile);
          return path && fs.existsSync(path) ? { id: path } : id;
        }

        return null;
      },
      load(id) {
        if (id === VIRTUAL_APP_REQUEST_PATH) {
          return `
import { h, resolveDynamicComponent } from 'vue';
export function configureApp() {};
export default { props: ['component'], render({ component }) { return resolveDynamicComponent(h(component));  } };
          `;
        }

        return null;
      },
      async transform(code, id) {
        // Transform raw SVG's into Vue components.
        if (SVG_ID_RE.test(id) && RAW_VUE_ID_RE.test(id)) {
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
            read: () => svgToVue(content),
          });
        }
      },
    },
    vuePlugin,
  ];
}

function svgToVue(svg: string): string {
  return `<template>${svg}</template><script>export default {}</script>`;
}
