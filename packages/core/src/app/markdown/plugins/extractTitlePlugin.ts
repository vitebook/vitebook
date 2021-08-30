import type { PluginSimple } from 'markdown-it';

import { resolveTitleFromToken } from '../../../utils/markdown.js';
import type { MarkdownEnv } from '../Markdown.js';

/**
 * Extracting markdown title to env.
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
  md.render = (src, env: MarkdownEnv = {}) => {
    const result = render(src, env);
    env.title = env.frontmatter?.title ?? title;
    return result;
  };
};
