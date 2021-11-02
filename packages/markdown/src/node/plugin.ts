import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { App, Plugin } from '@vitebook/core/node';

import type { MarkdownPlugin } from './MarkdownPlugin';
import {
  createMarkdownParser,
  loadParsedMarkdown,
  MarkdownParser,
  MarkdownParserOptions,
  parseMarkdown,
} from './parser';

export const PLUGIN_NAME = '@vitebook/markdown' as const;

export type MarkdownPluginOptions = MarkdownParserOptions & {
  /**
   * Filter out which files to be included as markdown pages.
   *
   * @default /\.md($|\?)/
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as markdown pages.
   *
   * @default undefined
   */
  exclude?: FilterPattern;
};

const DEFAULT_INCLUDE = /\.md($|\?)/;

export function markdownPlugin(options: MarkdownPluginOptions = {}): Plugin {
  let app: App;
  let parser: MarkdownParser;

  const { include, exclude, ...parserOptions } = options;

  const filter = createFilter(include ?? DEFAULT_INCLUDE, exclude);

  /** Page system file paths. */
  const files = new Set<string>();

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    async configureApp(_app) {
      app = _app;
      parser = await createMarkdownParser(parserOptions);
      for (const plugin of app.plugins) {
        const mdPlugin = plugin as MarkdownPlugin;
        await mdPlugin.configureMarkdownParser?.(parser);
      }
    },
    async resolvePage({ filePath }) {
      if (filter(filePath)) {
        files.add(filePath);
        return {
          type: 'md',
        };
      }

      return null;
    },
    pagesRemoved(pages) {
      pages.forEach((page) => {
        files.delete(page.filePath);
      });
    },
    transform(code, id) {
      if (files.has(id)) {
        const result = parseMarkdown(app, parser, code, id);
        return loadParsedMarkdown(result);
      }

      return null;
    },
  };
}
