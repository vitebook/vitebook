import {
  createMarkdownParser as createDefaultMarkdownParser,
  MarkdownParser,
  MarkdownParserOptions as DefaultMarkdownParserOptions
} from '@vitebook/plugin-markdown';

import {
  codePlugin,
  CodePluginOptions,
  customComponentPlugin,
  CustomComponentPluginOptions,
  hoistTagsPlugin,
  HoistTagsPluginOptions
} from './plugins/index';

export type MarkdownParserOptions = DefaultMarkdownParserOptions & {
  code?: false | CodePluginOptions;
  customComponent?: false | CustomComponentPluginOptions;
  hoistTags?: false | HoistTagsPluginOptions;
};

export function createMarkdownParser({
  customComponent,
  code,
  hoistTags,
  ...markdownOptions
}: MarkdownParserOptions): Promise<MarkdownParser> {
  return createDefaultMarkdownParser({
    ...markdownOptions,
    // Use Vue specific plugins.
    code: false,
    customComponent: false,
    async configureParser(parser) {
      await markdownOptions.configureParser?.(parser);

      // Treat unknown html tags as custom components.
      if (customComponent !== false) {
        parser.use(customComponentPlugin, customComponent);
      }

      // Hoist Vue SFC blocks and extract them into `env`.
      if (hoistTags !== false) {
        parser.use<HoistTagsPluginOptions>(hoistTagsPlugin, hoistTags);
      }

      // Process code fences.
      if (code !== false) {
        parser.use<CodePluginOptions>(codePlugin, code);
      }
    }
  });
}
