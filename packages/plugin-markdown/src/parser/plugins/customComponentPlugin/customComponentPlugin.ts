import type { PluginWithOptions } from 'markdown-it';

import { htmlBlockRule, HTMLBlockSequence } from './htmlBlockRule.js';
import { htmlInlineRule } from './htmlInlineRule.js';

export type CustomComponentPluginOptions = {
  /**
   * Custom HTML block sequences. A sequence is a pair of opening and closing HTML tags such as
   * `<p>` and `</p>`. This option can be used to add support for custom component sequences.
   *
   * @default []
   */
  customSequences?: HTMLBlockSequence[];
};

/**
 * Replacing the default `htmlBlock` rule to allow using custom components in markdown.
 */
export const customComponentPlugin: PluginWithOptions<CustomComponentPluginOptions> =
  (parser, { customSequences }: CustomComponentPluginOptions = {}): void => {
    // Override default html block ruler.
    parser.block.ruler.at('html_block', htmlBlockRule(customSequences), {
      alt: ['paragraph', 'reference', 'blockquote']
    });

    // Override default html inline ruler.
    parser.inline.ruler.at('html_inline', htmlInlineRule);
  };
