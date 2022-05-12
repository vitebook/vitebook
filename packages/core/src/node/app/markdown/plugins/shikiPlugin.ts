import { type PluginSimple } from 'markdown-it';
import { getHighlighter, type HighlighterOptions, renderToHtml } from 'shiki';

export const createShikiPlugin = async (options?: HighlighterOptions) => {
  const highlighter = await getHighlighter({
    theme: 'material-palenight',
    langs: [],
    ...options,
  });

  return ((parser) => {
    parser.options.highlight = (code, lang) => {
      const tokens = highlighter.codeToThemedTokens(code, lang);
      return renderToHtml(tokens);
    };
  }) as PluginSimple;
};
