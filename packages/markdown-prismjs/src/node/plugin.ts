import type { MarkdownPlugin } from '@vitebook/markdown/node';

import { loadLanguages } from './loadLanguages';
import { resolveHighlighter } from './resolveHighlighter';

export const PLUGIN_NAME = '@vitebook/markdown-prismjs' as const;

export type PrismjsPluginOptions = {
  /**
   * Languages to preload.
   *
   * Workaround for prismjs language reloading issue.
   *
   * @see https://github.com/PrismJS/prism/issues/2716
   */
  preloadLanguages?: string[];
};

export function prismjsMarkdownPlugin(
  options: PrismjsPluginOptions = {},
): MarkdownPlugin {
  return {
    name: PLUGIN_NAME,
    async configureMarkdownParser(parser) {
      const preloadLanguages = options.preloadLanguages ?? [
        'markdown',
        'jsdoc',
        'yaml',
      ];

      if (preloadLanguages?.length !== 0) {
        loadLanguages(preloadLanguages);
      }

      parser.options.highlight = (code, lang) => {
        const highlighter = resolveHighlighter(lang);
        return highlighter?.(code) || '';
      };
    },
  };
}
