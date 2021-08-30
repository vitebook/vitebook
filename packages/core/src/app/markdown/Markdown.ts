import MarkdownIt from 'markdown-it';

import type {
  MarkdownPageFrontmatter,
  MarkdownPageHeader
} from '../page/data/MarkdownPageData.js';
import type { AnchorPluginOptions } from './plugins/anchorPlugin.js';
import type { AssetsPluginOptions } from './plugins/assetsPlugin/assetsPlugin.js';
import type { CodePluginOptions } from './plugins/codePlugin/codePlugin.js';
import type { EmojiPluginOptions } from './plugins/emojiPlugin.js';
import type { ExtractHeadersPluginOptions } from './plugins/extractHeadersPlugin.js';
import type { HoistTagsPluginOptions } from './plugins/hoistTagsPlugin.js';
import type { ImportCodePluginOptions } from './plugins/importCodePlugin/importCodePlugin.js';
import type { LinksPluginOptions } from './plugins/linksPlugin.js';
import type { TocPluginOptions } from './plugins/tocPlugin/tocPlugin.js';

export type Markdown = MarkdownIt;

export type MarkdownOptions = MarkdownIt.Options & {
  anchor?: false | AnchorPluginOptions;
  assets?: false | AssetsPluginOptions;
  code?: false | CodePluginOptions;
  customComponent?: false;
  emoji?: false | EmojiPluginOptions;
  extractHeaders?: false | ExtractHeadersPluginOptions;
  extractTitle?: false;
  hoistTags?: false | HoistTagsPluginOptions;
  importCode?: false | ImportCodePluginOptions;
  links?: false | LinksPluginOptions;
  toc?: false | TocPluginOptions;
};

/**
 * Headers in markdown file.
 */
export type MarkdownHeader = MarkdownPageHeader;

/**
 * Internal links in markdown file. Used for file existence check.
 */
export interface MarkdownLink {
  raw: string;
  relative: string;
  absolute: string;
}

/**
 * The `env` object to be passed to `markdown-it` render function.
 *
 * - Input: metadata provided to parser.
 * - Output: resources extracted from the markdown file.
 */
export type MarkdownEnv = {
  // *** Input ***

  /**
   * Base / publicPath of current site.
   */
  baseUrl?: string;

  /**
   * Absolute file path of the markdown file.
   */
  filePath?: string | null;

  /**
   * Relative file path of the markdown file.
   */
  filePathRelative?: string | null;

  /**
   * Frontmatter of the markdown file.
   */
  frontmatter?: MarkdownPageFrontmatter;

  // *** Output ***

  /**
   * Headers that extracted by `extractHeadersPlugin`.
   */
  headers?: MarkdownHeader[];

  /**
   * Hoisted tags that extracted by `hoistTagsPlugin`.
   */
  hoistedTags?: string[];

  /**
   * Imported file that extracted by `importCodePlugin`.
   */
  importedFiles?: string[];

  /**
   * Links that extracted by `linksPlugin`.
   */
  links?: MarkdownLink[];

  /**
   * Title that extracted by `extractTitlePlugin`.
   */
  title?: string;
};
