import { filePathToRoute, isLinkExternal } from '@vitebook/core/node';
import { resolveRelativePath } from '@vitebook/core/node/utils';
import fs from 'fs';
import type { PluginWithOptions } from 'markdown-it';

import type { MarkdownParserEnv } from '../types';

export type LinksPluginOptions = {
  /**
   * Tag for internal links.
   *
   * @default 'a'
   */
  internalTag?: 'a' | 'RouterLink';

  /**
   * Additional attributes for external links.
   *
   * @default
   * ```js
   * ({
   *   target: '_blank',
   *   rel: 'noopener noreferrer',
   * })
   * ```
   */
  externalAttrs?: Record<string, string>;

  /**
   * Whether to render an outbound icon next to external links.
   *
   * @default true
   */
  externalIcon?: boolean;
};

/**
 * Resolves link URLs.
 */
export const linksPlugin: PluginWithOptions<LinksPluginOptions> = (
  parser,
  linkOptions: LinksPluginOptions = {},
): void => {
  let hasOpenInternalLink = false;
  let hasOpenExternalLink = false;

  const internalTag = linkOptions.internalTag ?? 'a';
  const externalIcon = linkOptions.externalIcon ?? true;

  // Attrs that going to be added to external links.
  const externalAttrs = {
    target: '_blank',
    rel: 'noopener noreferrer',
    ...linkOptions.externalAttrs,
  };

  parser.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex('href');

    const { app, filePath, frontmatter } = env as MarkdownParserEnv;

    if (hrefIndex >= 0) {
      const hrefAttr = token.attrs![hrefIndex];
      const hrefLink = hrefAttr[1];

      const internalLinkMatch = decodeURIComponent(hrefLink).match(
        /^((?:.*)(?:\/|\.md|\.html))(#.*)?$/,
      );

      const withRouterLink = () => {
        if (internalTag === 'RouterLink') {
          // Convert starting tag of internal link to `<RouterLink>`.
          token.tag = internalTag;
          // Replace the original `href` attr with `to` attr.
          hrefAttr[0] = 'to';
          // Set `hasOpenInternalLink` to modify the ending tag.
          hasOpenInternalLink = true;
        }
      };

      if (isLinkExternal(hrefLink, app?.site.options.baseUrl)) {
        Object.entries(externalAttrs ?? {}).forEach(([key, val]) => {
          token.attrSet(key, val);
        });

        if (
          (frontmatter?.externalIcon ?? externalIcon) &&
          externalAttrs.target === '_blank'
        ) {
          hasOpenExternalLink = true;
        }
      } else if (internalLinkMatch) {
        const rawPath = internalLinkMatch?.[1];
        const rawHash = internalLinkMatch?.[2] ?? '';

        const absolutePath = rawPath?.startsWith('/')
          ? app!.dirs.src.resolve('.' + rawPath)
          : resolveRelativePath(filePath!, rawPath);

        const fileContent = fs.readFileSync(absolutePath).toString();
        const route = filePathToRoute(app!, absolutePath, fileContent);

        withRouterLink();

        // Set new path.
        hrefAttr[1] = route + rawHash;

        const links = env.links || (env.links = []);
        links.push(hrefAttr[1].replace(/\.html$/, ''));
      } else if (hrefLink.startsWith('#')) {
        withRouterLink();
      }
    }

    return self.renderToken(tokens, idx, options);
  };

  parser.renderer.rules.link_close = (tokens, idx, options, env, self) => {
    const token = tokens[idx];

    // Add external icon before ending tag of external link.
    if (hasOpenExternalLink) {
      hasOpenExternalLink = false;
      return '<OutboundLink/>' + self.renderToken(tokens, idx, options);
    }

    // Convert ending tag of internal link.
    if (hasOpenInternalLink) {
      hasOpenInternalLink = false;
      token.tag = internalTag;
    }

    return self.renderToken(tokens, idx, options);
  };
};
