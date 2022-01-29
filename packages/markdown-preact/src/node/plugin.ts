import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { App, Plugin } from '@vitebook/core/node';
import { ensureLeadingSlash } from '@vitebook/core/node';
import { logger } from '@vitebook/core/node/utils';
import type { MarkdownParser, MarkdownPlugin } from '@vitebook/markdown/node';
import kleur from 'kleur';

import {
  createMarkdownParser,
  MarkdownParserOptions,
  parseMarkdownToPreact,
} from './parser';

export const PLUGIN_NAME = '@vitebook/markdown-preact' as const;

export type PreactMarkdownPluginOptions = MarkdownParserOptions & {
  /**
   * Filter out which files to be included as preact/react markdown pages.
   *
   * @default /\.md($|\?)/
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as preact/react markdown pages.
   *
   * @default undefined
   */
  exclude?: FilterPattern;
};

const DEFAULT_INCLUDE_RE = /\.md($|\?)/;

export function preactMarkdownPlugin(
  options: PreactMarkdownPluginOptions = {},
): Plugin {
  let app: App;
  let parser: MarkdownParser;
  let isBuild: boolean;
  let define: Record<string, unknown> | undefined;

  const { include, exclude, ...parserOptions } = options;

  const filter = createFilter(include ?? DEFAULT_INCLUDE_RE, exclude);

  /** Page system file paths. */
  const files = new Set<string>();

  let prefreshPlugin: Plugin;

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
      define = config.define;
    },
    async configureApp(_app) {
      app = _app;

      if (!_app.plugins.find((plugin) => plugin.name === '@vitebook/preact')) {
        throw logger.createError(
          `${kleur.bold('@vitebook/markdown-preact')} requires ${kleur.bold(
            '@vitebook/preact',
          )}`,
        );
      }

      prefreshPlugin = _app.plugins.find(
        (plugin) => plugin.name === 'prefresh',
      ) as Plugin;

      parser = await createMarkdownParser(parserOptions);
      for (const plugin of app.plugins) {
        const mdPlugin = plugin as MarkdownPlugin;
        await mdPlugin.configureMarkdownParser?.(parser);
      }
    },
    async resolvePage({ filePath, relativeFilePath }) {
      if (filter(filePath)) {
        files.add(filePath);
        return {
          id: '@vitebook/preact/PreactPageView.svelte',
          type: 'preact:md',
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
    transform(code, id, ...args) {
      if (files.has(id)) {
        const { component } = parseMarkdownToPreact(app, parser, code, id, {
          escapeConstants: isBuild,
          define,
        });

        return app.env.command === 'dev'
          ? prefreshPlugin.transform?.call(
              this,
              component,
              id.replace(DEFAULT_INCLUDE_RE, '.tsx'),
              ...args,
            )
          : component;
      }

      return null;
    },
  };
}
