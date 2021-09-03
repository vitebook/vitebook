import MarkdownIt from 'markdown-it';

import type { MarkdownParser, MarkdownParserOptions } from './Markdown.js';
import {
  anchorPlugin,
  AnchorPluginOptions,
  codePlugin,
  CodePluginOptions,
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
  TocPluginOptions
} from './plugins/index.js';
import { slugify } from './utils.js';

export const createMarkdownParser = async ({
  anchor,
  code,
  customComponent,
  emoji,
  extractHeaders,
  extractTitle,
  importCode,
  links,
  toc,
  configureParser,
  ...markdownItOptions
}: MarkdownParserOptions = {}): Promise<MarkdownParser> => {
  // create raw markdown-it instance
  const md = MarkdownIt({
    ...markdownItOptions,
    // should always enable html option
    html: true
  });

  // =====================================================
  // following plugins push rules to the end of chain, so
  // the order to use them is important

  // parse emoji
  if (emoji !== false) {
    md.use<EmojiPluginOptions>(emojiPlugin, emoji);
  }

  // add anchor to headers
  if (anchor !== false) {
    md.use<AnchorPluginOptions>(anchorPlugin, {
      level: [1, 2, 3, 4, 5, 6],
      slugify,
      permalink: anchorPlugin.permalink.ariaHidden({
        class: 'header-anchor',
        symbol: '#',
        space: true,
        placement: 'before'
      }),
      ...anchor
    });
  }

  // allow toc syntax
  if (toc !== false) {
    md.use<TocPluginOptions>(tocPlugin, toc);
  }

  // extract headers into env
  if (extractHeaders !== false) {
    md.use<ExtractHeadersPluginOptions>(extractHeadersPlugin, extractHeaders);
  }

  // extract title into env
  if (extractTitle !== false) {
    md.use(extractTitlePlugin);
  }

  // =====================================================
  // following plugins modify or replace the rule in place
  // and have no conflicts, so the order is not important

  // treat unknown html tags as custom components
  if (customComponent !== false) {
    md.use(customComponentPlugin, customComponent);
  }

  // process external and internal links
  if (links !== false) {
    md.use<LinksPluginOptions>(linksPlugin, links);
  }

  // process code fence
  if (code !== false) {
    md.use<CodePluginOptions>(codePlugin, code);
  }

  // handle import_code syntax
  if (importCode !== false) {
    md.use<ImportCodePluginOptions>(importCodePlugin, importCode);
  }

  await configureParser?.(md);

  return md;
};
