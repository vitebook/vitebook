import type { PluginSimple } from 'markdown-it';

import type { MarkdownParserEnv } from '../Markdown.js';
import { resolveTitleFromToken } from '../utils.js';

/**
 * Extracting markdown title to parser env.
 */
export const extractTitlePlugin: PluginSimple = (md): void => {
  let title: string;

  // Push the rule to the end of the chain, and resolve title from the parsed tokens.
  md.core.ruler.push('resolveExtractTitle', (state) => {
    const tokenIdx = state.tokens.findIndex((token) => token.tag === 'h1');
    if (tokenIdx > -1) {
      title = resolveTitleFromToken(state.tokens[tokenIdx + 1], {
        escapeText: false,
        allowHtml: false
      });
    } else {
      title = '';
    }
    return true;
  });

  // Extract title to env.
  const render = md.render.bind(md);
  md.render = (src, env: MarkdownParserEnv = {}) => {
    const result = render(src, env);
    env.title = env.frontmatter?.title ?? title;
    return result;
  };
};
