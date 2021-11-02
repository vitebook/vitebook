import type { PluginWithOptions } from 'markdown-it';
import type Token from 'markdown-it/lib/token';

import type { MarkdownParser } from '../../types';
import {
  isHighlightLine,
  resolveHighlightLines,
} from './resolveHighlightLines';
import { resolveLanguage } from './resolveLanguage';
import { resolveLineNumbers } from './resolveLineNumbers';

export type CodePluginOptions = {
  /**
   * Enable highlight lines or not.
   *
   * @default true
   */
  highlightLines?: boolean;

  /**
   * Enable line numbers or not.
   *
   * - A `boolean` value is to enable line numbers or not.
   * - A `number` value is the minimum number of lines to enable line numbers
   *
   * @default true
   */
  lineNumbers?: boolean | number;

  /**
   * Wrap the `<pre>` tag with an extra `<div>` or not. Do not disable it unless you
   * understand what's it for.
   *
   * - Required for `highlightLines`
   * - Required for `lineNumbers`
   * - Required for language display of default theme
   *
   * @default true
   */
  preWrapper?: boolean;

  /**
   * Transform the HTML block before the `preWrapper`.
   *
   * @default undefined
   */
  transformBeforeWrapper?(
    parser: MarkdownParser,
    token: Token,
    html: string,
  ): string;

  /**
   * Transform the final HTML block before it's returned.
   *
   * @default undefined
   */
  transformFinal?(parser: MarkdownParser, token: Token, html: string): string;
};

/**
 * Plugin to enable styled code fences with line numbers, syntax highlighting, etc.
 */
export const codePlugin: PluginWithOptions<CodePluginOptions> = (
  parser,
  {
    highlightLines = true,
    lineNumbers = true,
    preWrapper = true,
    transformBeforeWrapper,
    transformFinal,
  }: CodePluginOptions = {},
): void => {
  // Override default fence renderer.
  parser.renderer.rules.fence = (tokens, idx, options) => {
    const token = tokens[idx];

    // Get token info.
    const info = token.info ? parser.utils.unescapeAll(token.info).trim() : '';

    // Resolve language from token info.
    const language = resolveLanguage(info);
    const languageClass = `${options.langPrefix}${language.name}`;

    // Try to get highlighted code.
    const code =
      options.highlight?.(token.content, language.name, '') ||
      parser.utils.escapeHtml(token.content);

    // Wrap highlighted code with `<pre>` and `<code>`.
    let html = code.startsWith('<pre')
      ? code
      : `<pre class="${languageClass}"><code>${code}</code></pre>`;

    html = transformBeforeWrapper?.(parser, token, html) ?? html;

    // If `preWrapper` is disabled, return directly.
    if (!preWrapper) {
      return html;
    }

    // Code fences always have an ending `\n`, so we should trim the last line.
    const lines = code.split('\n').slice(0, -1);

    // Resolve highlight line ranges from token info.
    const highlightLinesRanges = highlightLines
      ? resolveHighlightLines(info)
      : null;
    // Generate highlight lines.
    if (highlightLinesRanges) {
      const highlightLinesCode = lines
        .map((_, index) => {
          if (isHighlightLine(index + 1, highlightLinesRanges)) {
            return '<div class="highlight-line">&nbsp;</div>';
          }
          return '<br>';
        })
        .join('');

      html = `${html}<div class="highlight-lines">${highlightLinesCode}</div>`;
    }

    // Resolve line-numbers mark from token info.
    const useLineNumbers =
      resolveLineNumbers(info) ??
      (typeof lineNumbers === 'number'
        ? lines.length >= lineNumbers
        : lineNumbers);
    // Generate line numbers.
    if (useLineNumbers) {
      // Generate line numbers code.
      const lineNumbersCode = lines
        .map((_, index) => `<span class="line-number">${index + 1}</span><br>`)
        .join('');

      html = `${html}<div class="line-numbers">${lineNumbersCode}</div>`;
    }

    html = `<div class="${languageClass} ext-${language.ext}${
      useLineNumbers ? ' line-numbers-mode' : ''
    }">${html}</div>`;

    html = transformFinal?.(parser, token, html) ?? html;

    return html;
  };
};
