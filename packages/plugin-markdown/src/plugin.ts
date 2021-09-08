import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { Plugin } from '@vitebook/core';

import {
  createMarkdownParser,
  loadParsedMarkdown,
  MarkdownParser,
  MarkdownParserOptions,
  parseMarkdown
} from './parser/index';
import type { ResolvedMarkdownPage } from './shared/index';

export const PLUGIN_NAME = 'vitebook/plugin-markdown' as const;

export type MarkdownPluginOptions = MarkdownParserOptions & {
  /**
   * Filter out which files to be included as markdown pages.
   *
   * @default /\.md$/
   */
  pages?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as markdown pages.
   *
   * @default undefined
   */
  pagesExclude?: FilterPattern;
};

const defaultPagesRE = /\.md$/;

export function markdownPlugin(options: MarkdownPluginOptions = {}): Plugin {
  let parser: MarkdownParser;

  const { pages: userPagesRE, pagesExclude, ...parserOptions } = options;

  const pages = userPagesRE ?? defaultPagesRE;
  const pagesFilter = createFilter(pages, pagesExclude);

  /** Page system file paths. */
  const files = new Set<string>();

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    async configureApp() {
      parser = await createMarkdownParser(parserOptions);
    },
    async resolvePage({ filePath }): Promise<ResolvedMarkdownPage | void> {
      if (pagesFilter(filePath)) {
        files.add(filePath);
        return {
          type: 'md'
        };
      }
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
