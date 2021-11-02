import {
  customComponentPlugin as defaultCustomComponentPlugin,
  CustomComponentPluginOptions,
} from '@vitebook/markdown/node';
import type { PluginWithOptions } from 'markdown-it';

export type { CustomComponentPluginOptions };

/**
 * Replacing the default `htmlBlock` rule to allow using custom components in markdown.
 */
export const customComponentPlugin: PluginWithOptions<CustomComponentPluginOptions> =
  (
    parser,
    { customSequences = [], ...options }: CustomComponentPluginOptions = {},
  ) => {
    defaultCustomComponentPlugin(parser, {
      ...options,
      customSequences: [...customSequences],
    });
  };
