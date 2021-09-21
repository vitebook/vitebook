import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { Plugin } from '@vitebook/core/node';

import {
  createMarkdownParser,
  loadParsedMarkdown,
  MarkdownParser,
  MarkdownParserOptions,
  parseMarkdown
} from './parser/index';

export const PLUGIN_NAME = 'vitebook/plugin-markdown' as const;

export type MarkdownPluginOptions = MarkdownParserOptions & {
  /**
   * Filter out which files to be included as markdown pages.
   *
   * @default /\.md$/
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as markdown pages.
   *
   * @default undefined
   */
  exclude?: FilterPattern;
};

const DEFAULT_INCLUDE = /\.md$/;

export function markdownPlugin(options: MarkdownPluginOptions = {}): Plugin {
  let parser: MarkdownParser;

  const { include, exclude, ...parserOptions } = options;

  const filter = createFilter(include ?? DEFAULT_INCLUDE, exclude);

  /** Page system file paths. */
  const files = new Set<string>();

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    async configureApp() {
      parser = await createMarkdownParser(parserOptions);
    },
    async resolvePage({ filePath }) {
      if (filter(filePath)) {
        files.add(filePath);
        return {
          type: 'md'
        };
      }

      return null;
    },
    pagesRemoved(pages) {
      pages.forEach((page) => {
        files.delete(page.filePath);
      });
    },
    transform(source, id) {
      if (files.has(id)) {
        const result = parseMarkdown(parser, source, id);
        return loadParsedMarkdown(result);
      }

      return null;
    }
  };
}
