import type { PluginWithOptions } from 'markdown-it';
import type { RenderRule } from 'markdown-it/lib/renderer';

import type { MarkdownEnv } from '../../Markdown.js';
import { resolveLink } from './resovleLink.js';

export type AssetsPluginOptions = {
  /**
   * Prefix to add to relative assets links.
   */
  relativePathPrefix?: string;
};

/**
 * Plugin to handle assets links.
 */
export const assetsPlugin: PluginWithOptions<AssetsPluginOptions> = (
  md,
  { relativePathPrefix = '@source' }: AssetsPluginOptions = {}
) => {
  // Wrap raw image renderer rule.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const rawImageRule = md.renderer.rules.image!;
  md.renderer.rules.image = (tokens, idx, options, env: MarkdownEnv, self) => {
    const token = tokens[idx];

    // Get the image link.
    const link = token.attrGet('src');

    if (link) {
      // Replace the original link with resolved link.
      token.attrSet('src', resolveLink(link, relativePathPrefix, env));
    }

    return rawImageRule(tokens, idx, options, env, self);
  };

  // Wrap raw html renderer rule.
  const createHtmlRule =
    (rawHtmlRule: RenderRule): RenderRule =>
    (tokens, idx, options, env: MarkdownEnv, self) => {
      // Replace the original link with resolved link.
      tokens[idx].content = tokens[idx].content.replace(
        /^( *<img\b.*src=")([^"]*)(")/s,
        (_, prefix, link, suffix) =>
          `${prefix}${resolveLink(link, relativePathPrefix, env)}${suffix}`
      );

      return rawHtmlRule(tokens, idx, options, env, self);
    };

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const rawHtmlBlockRule = md.renderer.rules.html_block!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const rawHtmlInlineRule = md.renderer.rules.html_inline!;

  md.renderer.rules.html_block = createHtmlRule(rawHtmlBlockRule);
  md.renderer.rules.html_inline = createHtmlRule(rawHtmlInlineRule);
};
