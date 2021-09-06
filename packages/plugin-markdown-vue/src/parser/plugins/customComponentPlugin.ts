import {
  customComponentPlugin as defaultCustomComponentPlugin,
  CustomComponentPluginOptions
} from '@vitebook/plugin-markdown';
import type { PluginWithOptions } from 'markdown-it';

export { CustomComponentPluginOptions };

/**
 * Vue reserved tags.
 *
 * @see https://v3.vuejs.org/api/built-in-components.html
 */
export const vueReservedTags = [
  'template',
  'component',
  'transition',
  'transition-group',
  'keep-alive',
  'slot',
  'teleport'
];

/**
 * Replacing the default `htmlBlock` rule to allow using custom components in markdown.
 */
export const customComponentPlugin: PluginWithOptions<CustomComponentPluginOptions> =
  (
    parser,
    { customSequences = [], ...options }: CustomComponentPluginOptions = {}
  ) => {
    defaultCustomComponentPlugin(parser, {
      ...options,
      customSequences: [
        ...customSequences,
        [
          // Treat Vue reserved tags as block tags.
          new RegExp(
            '^</?(' + vueReservedTags.join('|') + ')(?=(\\s|/?>|$))',
            'i'
          ),
          /^$/,
          true
        ]
      ]
    });
  };
