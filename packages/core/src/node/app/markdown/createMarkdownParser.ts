import MarkdownIt from 'markdown-it';

import { slugify } from './md-utils';
import {
  anchorPlugin,
  AnchorPluginOptions,
  codePlugin,
  CodePluginOptions,
  customTagsPlugin,
  emojiPlugin,
  EmojiPluginOptions,
  extractHeadersPlugin,
  ExtractHeadersPluginOptions,
  extractTitlePlugin,
  importCodePlugin,
  ImportCodePluginOptions,
  linksPlugin,
  LinksPluginOptions,
  overridesPlugin,
  tocPlugin,
  TocPluginOptions,
} from './plugins';
import { createShikiPlugin } from './plugins/shikiPlugin';
import type { MarkdownParser, MarkdownParserOptions } from './types';

export async function createMarkdownParser({
  anchor,
  code,
  customTags,
  emoji,
  extractHeaders,
  extractTitle,
  importCode,
  links,
  toc,
  shiki,
  overrides,
  configureParser,
  ...markdownItOptions
}: MarkdownParserOptions = {}): Promise<MarkdownParser> {
  const parser = MarkdownIt({
    ...markdownItOptions,
    // Should always enable html option.
    html: true,
  });

  // =====================================================
  // Following plugins push rules to the end of chain, so the usage order is important.

  // Parse emojis.
  if (emoji !== false) {
    parser.use<EmojiPluginOptions>(emojiPlugin, emoji);
  }

  // Add anchor to headers.
  if (anchor !== false) {
    parser.use<AnchorPluginOptions>(anchorPlugin, {
      level: [1, 2, 3, 4, 5, 6],
      slugify,
      permalink: anchorPlugin.permalink.ariaHidden({
        class: 'header-anchor',
        symbol: '#',
        space: true,
        placement: 'before',
      }),
      ...anchor,
    });
  }

  // Allow `toc` syntax.
  if (toc !== false) {
    parser.use<TocPluginOptions>(tocPlugin, toc);
  }

  // Extract `headers` into `env`.
  if (extractHeaders !== false) {
    parser.use<ExtractHeadersPluginOptions>(
      extractHeadersPlugin,
      extractHeaders,
    );
  }

  // Extract `title` into `env`.
  if (extractTitle !== false) {
    parser.use(extractTitlePlugin);
  }

  // =====================================================
  // Following plugins modify or replace the rule in place and have no conflicts, so the usage
  // order is not important.

  // Treat unknown html tags as custom tags.
  if (customTags !== false) {
    parser.use(customTagsPlugin, customTags);
  }

  // Process external and internal links.
  if (links !== false) {
    parser.use<LinksPluginOptions>(linksPlugin, links);
  }

  // Process code fences.
  if (code !== false) {
    parser.use<CodePluginOptions>(codePlugin, code);
  }

  // Handle `import_code` syntax.
  if (importCode !== false) {
    parser.use<ImportCodePluginOptions>(importCodePlugin, importCode);
  }

  // Highlight code blocks.
  if (shiki !== false) {
    parser.use(await createShikiPlugin(shiki));
  }

  parser.use(overridesPlugin, overrides);

  await configureParser?.(parser);

  return parser;
}
