import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { App, Plugin } from '@vitebook/core/node';
import type { MarkdownParser, MarkdownPlugin } from '@vitebook/markdown/node';

import {
  createMarkdownParser,
  MarkdownParserOptions,
  parseMarkdownToSvelte
} from './parser';

export const PLUGIN_NAME = '@vitebook/markdown-svelte' as const;

export type SvelteMarkdownPluginOptions = MarkdownParserOptions & {
  /**
   * Filter out which files to be included as svelte markdown pages.
   *
   * @default /\.md($|\?)/
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as svelte markdown pages.
   *
   * @default undefined
   */
  exclude?: FilterPattern;
};

const DEFAULT_INCLUDE_RE = /\.md($|\?)/;

export function svelteMarkdownPlugin(
  options: SvelteMarkdownPluginOptions = {}
): Plugin {
  let app: App;
  let parser: MarkdownParser;
  let isBuild: boolean;
  let define: Record<string, unknown> | undefined;

  const { include, exclude, ...parserOptions } = options;

  const filter = createFilter(include ?? DEFAULT_INCLUDE_RE, exclude);

  /** Page system file paths. */
  const files = new Set<string>();

  let sveltePlugin: Plugin;

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

      sveltePlugin = _app.plugins.find(
        (plugin) => plugin.name === 'vite-plugin-svelte'
      ) as Plugin;

      for (const plugin of app.plugins) {
        const mdPlugin = plugin as MarkdownPlugin;
        await mdPlugin.configureMarkdownParser?.(parser);
      }
    },
    async resolvePage({ filePath }) {
      if (filter(filePath)) {
        files.add(filePath);
        return {
          type: 'svelte:md'
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
        const { component } = parseMarkdownToSvelte(app, parser, code, id, {
          escapeConstants: isBuild,
          define
        });

        return component;
      }

      return null;
    },
    async handleHotUpdate(ctx) {
      const { file, read } = ctx;

      // Hot reload `.md` files as `.svelte` files.
      if (files.has(file)) {
        const content = await read();

        const { component } = parseMarkdownToSvelte(
          app,
          parser,
          content,
          file,
          {
            escapeConstants: isBuild,
            define
          }
        );

        return sveltePlugin?.handleHotUpdate?.({
          ...ctx,
          read: () => component
        });
      }
    }
  };
}
