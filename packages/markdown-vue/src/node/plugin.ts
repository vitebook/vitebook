import { createFilter, FilterPattern } from '@rollup/pluginutils';
import { App, ensureLeadingSlash, Plugin } from '@vitebook/core/node';
import { logger } from '@vitebook/core/node/utils';
import type { MarkdownParser, MarkdownPlugin } from '@vitebook/markdown/node';
import kleur from 'kleur';

import {
  createMarkdownParser,
  MarkdownParserOptions,
  parseMarkdownToVue,
} from './parser';

export const PLUGIN_NAME = '@vitebook/markdown-vue' as const;

export type VueMarkdownPluginOptions = MarkdownParserOptions & {
  /**
   * Filter out which files to be included as vue markdown pages.
   *
   * @default /\.md($|\?)/
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as vue markdown pages.
   *
   * @default undefined
   */
  exclude?: FilterPattern;
};

const DEFAULT_INCLUDE_RE = /\.md($|\?)/;

export function vueMarkdownPlugin(
  options: VueMarkdownPluginOptions = {},
): Plugin {
  let app: App;
  let parser: MarkdownParser;
  let isBuild: boolean;
  let define: Record<string, unknown> | undefined;

  const { include, exclude, ...parserOptions } = options;

  const filter = createFilter(include ?? DEFAULT_INCLUDE_RE, exclude);

  /** Page system file paths. */
  const files = new Set<string>();

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
      define = config.define;
    },
    async configureApp(_app) {
      app = _app;
      parser = await createMarkdownParser(parserOptions);

      if (!_app.plugins.find((plugin) => plugin.name === '@vitebook/vue')) {
        throw logger.createError(
          `${kleur.bold('@vitebook/markdown-vue')} requires ${kleur.bold(
            '@vitebook/vue',
          )}`,
        );
      }

      for (const plugin of app.plugins) {
        const mdPlugin = plugin as MarkdownPlugin;
        await mdPlugin.configureMarkdownParser?.(parser);
      }
    },
    async resolvePage({ filePath, relativeFilePath }) {
      if (filter(filePath)) {
        files.add(filePath);
        return {
          id: '@vitebook/vue/VuePageView.svelte',
          type: 'vue:md',
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
    transform(code, id) {
      if (files.has(id)) {
        const { component } = parseMarkdownToVue(app, parser, code, id, {
          escapeConstants: isBuild,
          define,
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

        const { component } = parseMarkdownToVue(app, parser, content, file, {
          escapeConstants: isBuild,
          define,
        });

        ctx.read = () => component;
      }
    },
  };
}
