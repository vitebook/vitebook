import type { PluginWithOptions } from 'markdown-it';

import {
  isHighlightLine,
  resolveHighlightLines
} from './resolveHighlightLines.js';
import { resolveLanguage } from './resolveLanguage.js';
import { resolveLineNumbers } from './resolveLineNumbers.js';

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
  transformBeforeWrapper?(html: string): string;

  /**
   * Transform the final HTML block before it's returned.
   *
   * @default undefined
   */
  transformFinal?(html: string): string;
};

/**
 * Plugin to enable styled code fences with line numbers, syntax highlighting, etc.
 */
export const codePlugin: PluginWithOptions<CodePluginOptions> = (
  md,
  {
    highlightLines = true,
    lineNumbers = true,
    preWrapper = true,
    transformBeforeWrapper,
    transformFinal
  }: CodePluginOptions = {}
): void => {
  // Override default fence renderer.
  md.renderer.rules.fence = (tokens, idx, options) => {
    const token = tokens[idx];

    // Get token info.
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : '';

    // Resolve language from token info.
    const language = resolveLanguage(info);
    const languageClass = `${options.langPrefix}${language.name}`;

    // Try to get highlighted code.
    const code =
      options.highlight?.(token.content, language.name, '') ||
      md.utils.escapeHtml(token.content);

    // Wrap highlighted code with `<pre>` and `<code>`.
    let result = code.startsWith('<pre')
      ? code
      : `<pre class="${languageClass}"><code>${code}</code></pre>`;

    result = transformBeforeWrapper?.(result) ?? result;

    // If `preWrapper` is disabled, return directly.
    if (!preWrapper) {
      return result;
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

      result = `${result}<div class="highlight-lines">${highlightLinesCode}</div>`;
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

      result = `${result}<div class="line-numbers">${lineNumbersCode}</div>`;
    }

    result = `<div class="${languageClass} ext-${language.ext}${
      useLineNumbers ? ' line-numbers-mode' : ''
    }">${result}</div>`;

    result = transformFinal?.(result) ?? result;

    return result;
  };
};
