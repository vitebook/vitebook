import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { Plugin } from '@vitebook/core';
import { logger } from '@vitebook/core/utils';
import type { MarkdownParser } from '@vitebook/plugin-markdown';
import kleur from 'kleur';

import {
  createMarkdownParser,
  MarkdownParserOptions,
  parseMarkdownToVue
} from './parser/index';
import type { ResolvedVueMarkdownPage } from './shared/index';

export const PLUGIN_NAME = 'vitebook/plugin-markdown-vue' as const;

export type VueMarkdownPluginOptions = MarkdownParserOptions & {
  /**
   * Filter out which files to be included as vue markdown pages.
   *
   * @default /\.md$/
   */
  pages?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as vue markdown pages.
   *
   * @default undefined
   */
  pagesExclude?: FilterPattern;
};

const defaultPagesRE = /\.md$/;

export function vueMarkdownPlugin(
  options: VueMarkdownPluginOptions = {}
): Plugin {
  let parser: MarkdownParser;
  let isBuild: boolean;
  let define: Record<string, unknown> | undefined;

  const { pages: userPagesRE, pagesExclude, ...parserOptions } = options;

  const pages = userPagesRE ?? defaultPagesRE;
  const pagesFilter = createFilter(pages, pagesExclude);

  /** Page system file paths. */
  const files = new Set<string>();
  /** Page file path to route map. */
  const routes = new Map<string, string>();

  let vuePlugin: Plugin;

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
      define = config.define;
    },
    async configureApp(app) {
      parser = await createMarkdownParser(parserOptions);

      vuePlugin = app.plugins.find(
        (plugin) => plugin.name === 'vite:vue'
      ) as Plugin;

      if (!vuePlugin) {
        throw logger.createError(
          `${kleur.bold(
            '@vitebook/plugin-markdown-vue'
          )} requires the ${kleur.bold('@vitejs/plugin-vue')} plugin.`
        );
      }
    },
    async resolvePage({
      filePath,
      route
    }): Promise<ResolvedVueMarkdownPage | void> {
      if (pagesFilter(filePath)) {
        files.add(filePath);
        routes.set(filePath, route);
        return {
          type: 'vue:md'
        };
      }
    },
    pagesRemoved(pages) {
      pages.forEach(({ filePath }) => {
        files.delete(filePath);
        routes.delete(filePath);
      });
    },
    transform(source, id) {
      if (files.has(id)) {
        const { component } = parseMarkdownToVue(parser, source, id, {
          escapeConstants: isBuild,
          define
        });

        return component;
      }

      return null;
    },
    async handleHotUpdate(ctx) {
      const { file, read } = ctx;

      // Hot reload `.md` files as `.vue` files.
      if (files.has(file)) {
        const content = await read();

        const { component } = parseMarkdownToVue(parser, content, file, {
          escapeConstants: isBuild,
          define
        });

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return vuePlugin.handleHotUpdate!({
          ...ctx,
          read: () => component
        });
      }
    }
  };
}
