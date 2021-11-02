import {
  createMarkdownParser as createDefaultMarkdownParser,
  MarkdownParser,
  MarkdownParserOptions as DefaultMarkdownParserOptions,
} from '@vitebook/markdown/node';

import {
  customComponentPlugin,
  CustomComponentPluginOptions,
  escapeCodePlugin,
  hoistTagsPlugin,
  HoistTagsPluginOptions,
} from './plugins';

export type MarkdownParserOptions = DefaultMarkdownParserOptions & {
  customComponent?: false | CustomComponentPluginOptions;
  hoistTags?: false | HoistTagsPluginOptions;
};

export function createMarkdownParser({
  customComponent,
  hoistTags,
  ...markdownOptions
}: MarkdownParserOptions): Promise<MarkdownParser> {
  return createDefaultMarkdownParser({
    ...markdownOptions,
    customComponent: false,
    async configureParser(parser) {
      await markdownOptions.configureParser?.(parser);

      // Treat unknown html tags as custom components.
      if (customComponent !== false) {
        parser.use(customComponentPlugin, customComponent);
      }

      // Hoist scripts blocks and extract them into `env`.
      if (hoistTags !== false) {
        parser.use<HoistTagsPluginOptions>(hoistTagsPlugin, hoistTags);
      }

      parser.use(escapeCodePlugin);
    },
  });
}
