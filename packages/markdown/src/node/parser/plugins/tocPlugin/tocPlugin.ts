import type { PluginWithOptions } from 'markdown-it';

import type { MarkdownHeader } from '../../../../shared';
import {
  resolveHeadersFromTokens,
  slugify as slugifyDefault,
} from '../../utils';
import { createRenderHeaders } from './createRenderHeader';
import { createTocBlockRule } from './createTocBlockRule';

export type TocPluginOptions = {
  /**
   * The pattern serving as the TOC placeholder in your markdown.
   *
   * @default undefined
   */
  pattern?: RegExp;

  /**
   * A custom slugify function.
   *
   * Should use the same slugify function with `markdown-it-anchor` to ensure the link is matched.
   *
   * @default undefined
   */
  slugify?: (str: string) => string;

  /**
   * A function for formatting headers.
   *
   * @default undefined
   */
  format?: (str: string) => string;

  /**
   * Heading level that going to be extracted to the `env`. Should be a subset of
   * the `markdown-it-anchor` `level` option to ensure the link exists.
   *
   * @default [2,3]
   */
  level?: number[];

  /**
   * HTML tag of container.
   *
   * @default 'nav'
   */
  containerTag?: string;

  /**
   * The class for container.
   *
   * @default 'table-of-contents'
   */
  containerClass?: string;

  /**
   * HTML tag of list.
   *
   * @default 'ul'
   */
  listTag?: 'ul' | 'ol';

  /**
   * The class for list.
   *
   * @default ''
   */
  listClass?: string;

  /**
   * The class for the `<li>` tag.
   *
   * @default ''
   */
  itemClass?: string;

  /**
   * The tag for the link inside `<li>`.
   *
   * @default 'a'
   */
  linkTag?: string;

  /**
   * The class for the link tag inside `<li>`.
   *
   * @default ''
   */
  linkClass?: string;
};

/**
 * Generate table of contents.
 *
 * Forked and modified from `markdown-it-toc-done-right`:
 *
 * - Allows `html_inline` tags in headings to support custom components.
 * - Allows custom tags for links.
 * - Code refactor and optimizations.
 *
 * @see https://github.com/nagaozen/markdown-it-toc-done-right
 */
export const tocPlugin: PluginWithOptions<TocPluginOptions> = (
  parser,
  {
    pattern = /^\[\[toc\]\]$/i,
    slugify = slugifyDefault,
    format,
    level = [2, 3],
    containerTag = 'nav',
    containerClass = 'table-of-contents',
    listTag = 'ul',
    listClass = '',
    itemClass = '',
    linkTag = 'a',
    linkClass = '',
  }: TocPluginOptions = {},
): void => {
  let headers: MarkdownHeader[];

  // Push the rule to the end of the chain, and resolve headers from the parsed tokens.
  parser.core.ruler.push('resolveTocHeaders', (state) => {
    headers = resolveHeadersFromTokens(state.tokens, {
      level,
      allowHtml: true,
      escapeText: true,
      slugify,
      format,
    });
    return true;
  });

  // Add toc syntax as a block rule.
  parser.block.ruler.before(
    'heading',
    'toc',
    createTocBlockRule({
      pattern,
      containerTag,
      containerClass,
    }),
    {
      alt: ['paragraph', 'reference', 'blockquote'],
    },
  );

  const renderHeaders = createRenderHeaders({
    listTag,
    listClass,
    itemClass,
    linkTag,
    linkClass,
  });

  // Custom toc_body render rule.
  parser.renderer.rules.toc_body = () => {
    /* istanbul ignore if */
    if (!headers) {
      return '';
    }

    return renderHeaders(headers);
  };
};
