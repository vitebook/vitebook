import MarkdownIt from 'markdown-it';

import { slugify } from '../../utils/markdown.js';
import type { Markdown, MarkdownOptions } from './Markdown.js';
import { anchorPlugin, AnchorPluginOptions } from './plugins/anchorPlugin.js';
import {
  assetsPlugin,
  AssetsPluginOptions
} from './plugins/assetsPlugin/assetsPlugin.js';
import {
  codePlugin,
  CodePluginOptions
} from './plugins/codePlugin/codePlugin.js';
import { customComponentPlugin } from './plugins/customComponentPlugin/customComponentPlugin.js';
import { emojiPlugin, EmojiPluginOptions } from './plugins/emojiPlugin.js';
import {
  extractHeadersPlugin,
  ExtractHeadersPluginOptions
} from './plugins/extractHeadersPlugin.js';
import { extractTitlePlugin } from './plugins/extractTitlePlugin.js';
import {
  hoistTagsPlugin,
  HoistTagsPluginOptions
} from './plugins/hoistTagsPlugin.js';
import {
  importCodePlugin,
  ImportCodePluginOptions
} from './plugins/importCodePlugin/importCodePlugin.js';
import { linksPlugin, LinksPluginOptions } from './plugins/linksPlugin.js';
import { tocPlugin, TocPluginOptions } from './plugins/tocPlugin/tocPlugin.js';

export const createMarkdownIt = ({
  anchor,
  assets,
  code,
  customComponent,
  emoji,
  extractHeaders,
  extractTitle,
  hoistTags,
  importCode,
  links,
  toc,
  ...markdownItOptions
}: MarkdownOptions = {}): Markdown => {
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
    md.use<TocPluginOptions>(tocPlugin, {
      level: [2, 3],
      slugify,
      linkTag: 'RouterLink',
      ...toc
    });
  }

  // extract headers into env
  if (extractHeaders !== false) {
    md.use<ExtractHeadersPluginOptions>(extractHeadersPlugin, {
      level: [2, 3],
      slugify,
      ...extractHeaders
    });
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
    md.use(customComponentPlugin);
  }

  // replace relative link of assets with absolute link
  if (assets !== false) {
    md.use<AssetsPluginOptions>(assetsPlugin, assets);
  }

  // hoist vue SFC blocks and extract them into env
  if (hoistTags !== false) {
    md.use<HoistTagsPluginOptions>(hoistTagsPlugin, hoistTags);
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

  return md;
};
