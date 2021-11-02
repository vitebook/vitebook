import type { PluginWithOptions } from 'markdown-it';

import type { MarkdownHeader } from '../../../shared';
import type { MarkdownParserEnv } from '../types';
import { resolveHeadersFromTokens, slugify as slugifyDefault } from '../utils';

export type ExtractHeadersPluginOptions = {
  /**
   * Heading level that's going to be extracted into the `env`. Should be a subset of
   * `markdown-it`anchor` `level` option to ensure the link is existed.
   *
   * @default [2,3]
   */
  level?: number[];

  /**
   * A custom slugify function. Should use the same slugify function with `markdown-it-anchor`
   * to ensure the link is matched.
   */
  slugify?: (str: string) => string;

  /**
   * A function for formatting headers.
   *
   * @default undefined
   */
  format?: (str: string) => string;
};

/**
 * Extracting markdown headers to `env`. Would be used for generating sidebar nav and toc.
 */
export const extractHeadersPlugin: PluginWithOptions<ExtractHeadersPluginOptions> =
  (
    parser,
    {
      level = [2, 3],
      slugify = slugifyDefault,
      format,
    }: ExtractHeadersPluginOptions = {},
  ): void => {
    let headers: MarkdownHeader[];

    // Push the rule to the end of the chain, and resolve headers from the parsed tokens.
    parser.core.ruler.push('resolveExtractHeaders', (state) => {
      headers = resolveHeadersFromTokens(state.tokens, {
        level,
        allowHtml: false,
        escapeText: false,
        slugify,
        format,
      });
      return true;
    });

    // Extract headers to `env`.
    const render = parser.render.bind(parser);
    parser.render = (src, env: MarkdownParserEnv = {}) => {
      const result = render(src, env);
      env.headers = headers;
      return result;
    };
  };
