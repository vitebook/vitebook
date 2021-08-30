import type { PluginSimple } from 'markdown-it';

import { htmlBlockRule } from './htmlBlockRule.js';
import { htmlInlineRule } from './htmlInlineRule.js';

/**
 * Replacing the default `htmlBlock` rule to allow using custom components in markdown.
 */
export const customComponentPlugin: PluginSimple = (md): void => {
  // Override default html block ruler.
  md.block.ruler.at('html_block', htmlBlockRule, {
    alt: ['paragraph', 'reference', 'blockquote']
  });

  // Override default html inline ruler.
  md.inline.ruler.at('html_inline', htmlInlineRule);
};
