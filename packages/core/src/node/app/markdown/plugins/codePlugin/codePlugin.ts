import type { PluginWithOptions } from 'markdown-it';

import type { HighlightLanguage } from './languages';
import {
  HighlightLinesRange,
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
   * @default true
   */
  lineNumbers?: boolean;

  /**
   * Custom code fence render function.
   */
  render?: (info: {
    language: HighlightLanguage;
    code: string;
    highlightedCode: string;
    linesCount: number;
    lineNumbers?: boolean;
    highlightedLines: HighlightLinesRange[];
  }) => string;
};

/**
 * Plugin to enable styled code fences with line numbers, syntax highlighting, etc.
 */
export const codePlugin: PluginWithOptions<CodePluginOptions> = (
  parser,
  { render, highlightLines = true, lineNumbers = true }: CodePluginOptions = {},
): void => {
  const defaultRender = parser.renderer.rules.fence!;

  // Override default fence renderer.
  parser.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];

    // Get token info.
    const info = token.info ? parser.utils.unescapeAll(token.info).trim() : '';

    // Resolve language from token info.
    const language = resolveLanguage(info);

    // Get un-escaped code content.
    const code = token.content
      .replace(/<script/g, '<script&#8203')
      .replace(/<style/g, '<style&#8203');

    // Try to get highlighted code.
    const highlightedCode =
      options.highlight?.(code, language.name, '') ||
      parser.utils.escapeHtml(code);

    const linesCount = (code.match(/"line"/g) || []).length;

    // Resolve highlight line ranges from token info.
    const highlightLinesRanges = resolveHighlightLines(info) ?? [];

    const highlightedLines = highlightLines
      ? highlightLinesRanges.filter((_, i) =>
          isHighlightLine(i + 1, highlightLinesRanges),
        )
      : [];

    return (
      render?.({
        language,
        code,
        highlightedCode,
        linesCount,
        lineNumbers: resolveLineNumbers(info) ?? lineNumbers,
        highlightedLines,
      }) ?? defaultRender(tokens, idx, options, env, self)
    );
  };
};
