import { type Config as MarkdocConfig } from '@markdoc/markdoc';
import type { FilterPattern } from '@rollup/pluginutils';
import { type Options as HastToHtmlConfig } from 'hast-util-to-html';
import type { HighlighterOptions as ShikiConfig } from 'shiki';

import type { HighlightCodeBlock, ParseMarkdownConfig } from '../markdoc';

export type ResolvedMarkdownConfig = {
  /**
   * Filter files to be processed as Markdown files.
   */
  include: FilterPattern;
  /**
   * Filter files to be excluded from Markdown processing.
   */
  exclude: FilterPattern;
  /**
   * Markdoc configuration options.
   */
  markdoc: MarkdocConfig;
  /**
   * Markdoc nodes configuration.
   */
  nodes: {
    /**
     * Globs pointing at files which should be included as Markdoc nodes/tags.
     */
    include: string[];
    /**
     * Globs or RegExp indicating node files which should be excluded from being Markdoc nodes/tags.
     */
    exclude: (string | RegExp)[];
  };
  /**
   * Syntax highlighter configuration.
   *
   * - In order to use Shiki please install it `npm install shiki`.
   * - In order to use Starry Night please install it `npm install @woorm/starry-night`.
   *
   * @see {@link https://github.com/shikijs/shiki}
   * @see {@link https://github.com/wooorm/starry-night}
   */
  highlighter: 'shiki' | 'starry-night' | HighlightCodeBlock | false;
  /**
   * Shiki configuration options.
   */
  shiki: ShikiConfig;
  /**
   * HAST to HTML transformer configuration. The tree returned from `starry-night` is a HAST
   * tree so it needs to be transformed to HTML - you can configure it here.
   *
   * @see {@link https://github.com/wooorm/starry-night}
   * @see {@link https://github.com/syntax-tree/hast-util-to-html}
   */
  hastToHtml: HastToHtmlConfig;
  /**
   * Markdoc AST transformers.
   */
  transformAst: ParseMarkdownConfig['transformAst'];
  /**
   * Called for each render node in the Markdoc renderable tree. This function can be used to
   * transform the tree before it's rendered.
   */
  transformTreeNode: ParseMarkdownConfig['transformTreeNode'];
  /**
   * Markdoc renderable tree transformers (_after_ AST is transformed into render tree).
   */
  transformContent: ParseMarkdownConfig['transformContent'];
  /**
   * Markdown meta transformers (_before_ content is rendered).
   */
  transformMeta: ParseMarkdownConfig['transformMeta'];
  /**
   * Rendered Markdown output transformers.
   */
  transformOutput: ParseMarkdownConfig['transformOutput'];
  /**
   * Custom Markdoc renderer which takes render tree and produces final output.
   */
  render?: ParseMarkdownConfig['render'];
};

export type MarkdownConfig = Partial<ResolvedMarkdownConfig>;
