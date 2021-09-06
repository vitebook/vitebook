import type { Plugin } from '@vitebook/core';

import type { ResolvedMarkdownPage } from './page.js';
import {
  createMarkdownParser,
  loadParsedMarkdown,
  MarkdownParser,
  MarkdownParserOptions,
  parseMarkdown
} from './parser/index.js';

export const PLUGIN_NAME = 'vitebook/plugin-markdown' as const;

export type MarkdownPluginOptions = MarkdownParserOptions;

export function markdownPlugin(options: MarkdownPluginOptions = {}): Plugin {
  let parser: MarkdownParser;

  /** Page system file paths. */
  const files = new Set<string>();

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    async configureApp() {
      parser = await createMarkdownParser(options);
    },
    async resolvePage({ filePath }): Promise<ResolvedMarkdownPage | void> {
      if (filePath.endsWith('.md')) {
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
