import MarkdownIt from 'markdown-it';

import {
  anchorPlugin,
  AnchorPluginOptions,
  codePlugin,
  CodePluginOptions,
  containerPlugin,
  customComponentPlugin,
  emojiPlugin,
  EmojiPluginOptions,
  extractHeadersPlugin,
  ExtractHeadersPluginOptions,
  extractTitlePlugin,
  importCodePlugin,
  ImportCodePluginOptions,
  linksPlugin,
  LinksPluginOptions,
  tocPlugin,
  TocPluginOptions,
} from './plugins';
import type { MarkdownParser, MarkdownParserOptions } from './types';
import { slugify } from './utils';
import { withThemeScope } from './withThemeScope';

export async function createMarkdownParser({
  anchor,
  code,
  customComponent,
  customContainers,
  emoji,
  extractHeaders,
  extractTitle,
  importCode,
  links,
  toc,
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

  // Parse custom container blocks.
  if (customContainers !== false) {
    parser.use(containerPlugin);
  }

  // Treat unknown html tags as custom components.
  if (customComponent !== false) {
    parser.use(customComponentPlugin, customComponent);
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

  const render = parser.renderer.render;
  parser.renderer.render = function (...args) {
    const html = render.call(this, ...args);
    const { app } = args[2]; // args[2] = env
    return withThemeScope(html, app?.context?.themeScopeClass ?? '__vbk__');
  };

  await configureParser?.(parser);

  return parser;
}
