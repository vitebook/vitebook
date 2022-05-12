import type MarkdownIt from 'markdown-it';
import type { HighlighterOptions } from 'shiki';

import type {
  MarkdownFrontmatter,
  MarkdownHeader,
  MarkdownLinks,
  MarkdownMeta,
} from '../../../shared';
import type { App } from '../App';
import type {
  AnchorPluginOptions,
  CodePluginOptions,
  CustomTagsPluginOptions,
  EmojiPluginOptions,
  ExtractHeadersPluginOptions,
  ImportCodePluginOptions,
  LinksPluginOptions,
  OverridesPluginOptions,
  TocPluginOptions,
} from './plugins';

export type MarkdownParser = MarkdownIt;

export type MarkdownParserOptions = MarkdownIt.Options & {
  anchor?: false | AnchorPluginOptions;
  code?: false | CodePluginOptions;
  customContainers?: false;
  overrides?: OverridesPluginOptions;
  customTags?: false | CustomTagsPluginOptions;
  emoji?: false | EmojiPluginOptions;
  extractHeaders?: false | ExtractHeadersPluginOptions;
  extractTitle?: false;
  importCode?: false | ImportCodePluginOptions;
  links?: false | LinksPluginOptions;
  toc?: false | TocPluginOptions;
  shiki?: false | HighlighterOptions;
  configureParser?(parser: MarkdownParser): void | Promise<void>;
};

export type ParseMarkdownOptions = {
  escapeConstants?: boolean;
  define?: Record<string, unknown>;
};

export type ParsedMarkdownResult = {
  source: string;
  html: string;
  meta: MarkdownMeta;
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
  /** Hoisted `<script>` and `<style>` tags. */
  hoistedTags?: string[];
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

export type ComponentTopLevelTag = {
  scope: 'script' | 'module';
  content: string;
};
