import type { Plugin } from '@vitebook/core';

import type { ResolvedMarkdownPage } from './MarkdownPage.js';
import {
  createMarkdownParser,
  loadParsedMarkdown,
  MarkdownParser,
  MarkdownParserOptions,
  parseMarkdown
} from './parser/index.js';

export const PLUGIN_NAME = 'vitebook/plugin-markdown' as const;

export type MarkdownPluginOptions = MarkdownParserOptions & {
  load?(): string;
  transform?(): string;
};

export function markdownPlugin(options: MarkdownPluginOptions = {}): Plugin {
  let parser: MarkdownParser;

  /** Page system file paths. */
  const files = new Set<string>();

  return {
    name: PLUGIN_NAME,
    enforce: 'post',
    async configureApp() {
      parser = await createMarkdownParser(options);
    },
    async resolvePage({ filePath }): Promise<ResolvedMarkdownPage> {
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
    }
  };
}
