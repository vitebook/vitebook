import { Plugin, VM_PREFIX } from '@vitebook/core';

import { createMarkdownParser } from './createMarkdownParser.js';
import type { MarkdownParser, MarkdownParserOptions } from './Markdown.js';
import type { ResolvedMarkdownPage } from './MarkdownPage.js';

export const PLUGIN_NAME = 'vitebook/plugin-markdown' as const;
export const VM_DATA_PREFIX = `/${VM_PREFIX}/${PLUGIN_NAME}/data/` as const;

export type MarkdownPluginOptions = MarkdownParserOptions;

let parser: MarkdownParser;

export function markdownPlugin(options: MarkdownPluginOptions = {}): Plugin {
  // TODO: use LRU cache
  const cache = new Map();

  return {
    name: PLUGIN_NAME,
    async configureApp() {
      parser = await createMarkdownParser(options);
    },
    async resolvePage(id): Promise<ResolvedMarkdownPage> {
      if (!id.endsWith('.md')) return null;

      // parse and store meta
      // cache id => meta

      return {
        type: 'md',
        data: `${VM_DATA_PREFIX}${id}`
      };
    },
    async transform(code, id) {
      if (id.startsWith(VM_DATA_PREFIX)) {
        const filePath = id.replace(VM_DATA_PREFIX, '');
        // return cached data
      }

      if (id.endsWith('.md')) {
        // transform it.
        // component => { default: '<html></html>' }
      }

      return null;
    }
  };
}
