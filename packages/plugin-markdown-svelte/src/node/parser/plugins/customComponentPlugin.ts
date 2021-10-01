import {
  customComponentPlugin as defaultCustomComponentPlugin,
  CustomComponentPluginOptions
} from '@vitebook/plugin-markdown/node';
import type { PluginWithOptions } from 'markdown-it';

export { CustomComponentPluginOptions };

/**
 * Svelte reserved tags.
 *
 * @see https://svelte.dev/docs#svelte_self
 */
export const svelteReservedTags = [
  'svelte:self',
  'svelte:component',
  'svelte:window',
  'svelte:body',
  'svelte:head',
  'svelte:options',
  'svelte:fragment',
  'slot'
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
          // Treat Svelte reserved tags as block tags.
          new RegExp(
            '^</?(' + svelteReservedTags.join('|') + ')(?=(\\s|/?>|$))',
            'i'
          ),
          /^$/,
          true
        ]
      ]
    });
  };
