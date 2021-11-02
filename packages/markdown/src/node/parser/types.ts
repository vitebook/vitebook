import type { App } from '@vitebook/core/node';
import type MarkdownIt from 'markdown-it';

import {
  MarkdownFrontmatter,
  MarkdownHeader,
  MarkdownLinks,
  MarkdownPageMeta,
} from '../../shared';
import type {
  AnchorPluginOptions,
  CodePluginOptions,
  CustomComponentPluginOptions,
  EmojiPluginOptions,
  ExtractHeadersPluginOptions,
  ImportCodePluginOptions,
  LinksPluginOptions,
  TocPluginOptions,
} from './plugins';

export type MarkdownParser = MarkdownIt;

export type MarkdownParserOptions = MarkdownIt.Options & {
  anchor?: false | AnchorPluginOptions;
  code?: false | CodePluginOptions;
  customContainers?: false;
  customComponent?: false | CustomComponentPluginOptions;
  emoji?: false | EmojiPluginOptions;
  extractHeaders?: false | ExtractHeadersPluginOptions;
  extractTitle?: false;
  importCode?: false | ImportCodePluginOptions;
  links?: false | LinksPluginOptions;
  toc?: false | TocPluginOptions;
  configureParser?(parser: MarkdownParser): void | Promise<void>;
};

export type ParseMarkdownOptions = {
  escapeConstants?: boolean;
  define?: Record<string, unknown>;
};

export type ParsedMarkdownResult<
  Meta extends MarkdownPageMeta = MarkdownPageMeta,
> = {
  content: string;
  meta: Meta;
  html: string;
  links: MarkdownLinks;
  importedFiles: string[];
  env: MarkdownParserEnv;
};

/**
 * Metadata provided to markdown parser.
 */
export type MarkdownParserEnvInput = {
  /** Server application context. */
  app?: App;
  /** Absolute system file path of the markdown file. */
  filePath?: string | null;
  /** Frontmatter of the markdown file. */
  frontmatter?: MarkdownFrontmatter;
};

/**
 * Resources extracted from markdown parser.
 */
export type MarkdownParserEnvOutput = {
  /** Headers that are extracted by `extractHeadersPlugin`. */
  headers?: MarkdownHeader[];
  /** Imported files that are extracted by `importCodePlugin`. */
  importedFiles?: string[];
  /** Links that are extracted by `linksPlugin`. */
  links?: MarkdownLinks;
  /** Title that is extracted by `extractTitlePlugin`. */
  title?: string;
};

/**
 * The `env` object to be passed to `markdown-it` render function.
 */
export type MarkdownParserEnv = MarkdownParserEnvInput &
  MarkdownParserEnvOutput;
