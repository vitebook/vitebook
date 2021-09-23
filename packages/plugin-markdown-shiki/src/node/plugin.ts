import type { MarkdownPlugin } from '@vitebook/plugin-markdown/node';
import { getHighlighter, HighlighterOptions } from 'shiki';

export const PLUGIN_NAME = 'vitebook/plugin-markdown-shiki' as const;

export type ShikiPluginOptions = Pick<HighlighterOptions, 'theme' | 'langs'>;

export function shikiMarkdownPlugin(
  options: ShikiPluginOptions = {}
): MarkdownPlugin {
  return {
    name: PLUGIN_NAME,
    async configureMarkdownParser(parser) {
      const highlighter = await getHighlighter({
        theme: options.theme ?? 'nord',
        langs: options.langs ?? []
      });

      parser.options.highlight = (code, lang) =>
        highlighter.codeToHtml(code, lang);
    }
  };
}
