import type { HeadConfig } from '@vitebook/core';
import type MarkdownIt from 'markdown-it';

import type {
  AnchorPluginOptions,
  CodePluginOptions,
  CustomComponentPluginOptions,
  EmojiPluginOptions,
  ExtractHeadersPluginOptions,
  ImportCodePluginOptions,
  LinksPluginOptions,
  TocPluginOptions
} from './plugins/index.js';

export type MarkdownParser = MarkdownIt;

export type MarkdownParserOptions = MarkdownIt.Options & {
  anchor?: false | AnchorPluginOptions;
  code?: false | CodePluginOptions;
  customComponent?: false | CustomComponentPluginOptions;
  emoji?: false | EmojiPluginOptions;
  extractHeaders?: false | ExtractHeadersPluginOptions;
  extractTitle?: false;
  importCode?: false | ImportCodePluginOptions;
  links?: false | LinksPluginOptions;
  toc?: false | TocPluginOptions;
  configureParser?(parser: MarkdownParser): void | Promise<void>;
};

export type MarkdownHeader = {
  level: number;
  title: string;
  slug: string;
  children: MarkdownHeader[];
};

export type MarkdownLink = {
  raw: string;
  relative: string;
  absolute: string;
};

export type MarkdownFrontmatter = {
  date?: string | Date;
  description?: string;
  head?: HeadConfig[];
  lang?: string;
  layout?: string;
  permalink?: string;
  permalinkPattern?: string;
  title?: string;
};

/**
 * The `env` object to be passed to `markdown-it` render function.
 *
 * - Input: metadata provided to parser.
 * - Output: resources extracted from the markdown file.
 */
export type MarkdownParserEnv = {
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
  frontmatter?: MarkdownFrontmatter;

  // *** Output ***

  /**
   * Headers that extracted by `extractHeadersPlugin`.
   */
  headers?: MarkdownHeader[];

  /**
   * Imported file that extracted by `importCodePlugin`.
   */
  importedFiles?: string[];

  /**
   * Links that extracted by `linksPlugin`.
   */
  links?: string[];

  /**
   * Title that extracted by `extractTitlePlugin`.
   */
  title?: string;
};
