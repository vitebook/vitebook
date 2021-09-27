import { filePathToRoute } from '@vitebook/core/node';
import { resolveRelativePath } from '@vitebook/core/node/utils';
import { isLinkExternal } from '@vitebook/core/shared';
import type { PluginWithOptions } from 'markdown-it';

import type { MarkdownParserEnv } from '../types';

export type LinksPluginOptions = {
  /**
   * Tag for internal links.
   *
   * @default 'RouterLink'
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

const HASH_RE = /^((?:.*)(?:\/|\.md|\.html))(#.*)?$/;

/**
 * Resolves link URLs.
 */
export const linksPlugin: PluginWithOptions<LinksPluginOptions> = (
  parser,
  linkOptions: LinksPluginOptions = {}
): void => {
  let hasOpenInternalLink = false;
  let hasOpenExternalLink = false;

  const internalTag = linkOptions.internalTag ?? 'RouterLink';
  const externalIcon = linkOptions.externalIcon ?? true;

  // Attrs that going to be added to external links.
  const externalAttrs = {
    target: '_blank',
    rel: 'noopener noreferrer',
    ...linkOptions.externalAttrs
  };

  parser.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex('href');

    const { app, filePath, frontmatter } = env as MarkdownParserEnv;

    if (hrefIndex >= 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const hrefAttr = token.attrs![hrefIndex];
      const url = hrefAttr[1];
      const isExternal = isLinkExternal(url);

      if (isExternal) {
        Object.entries(externalAttrs ?? {}).forEach(([key, val]) => {
          token.attrSet(key, val);
        });

        if (
          (frontmatter?.externalIcon ?? externalIcon) &&
          externalAttrs.target === '_blank'
        ) {
          hasOpenExternalLink = true;
        }
      } else if (
        // internal anchor links
        !url.startsWith('#') &&
        // mail links
        !url.startsWith('mailto:')
      ) {
        if (internalTag === 'RouterLink') {
          const pathMatch = hrefAttr[1].match(HASH_RE);

          const rawPath = pathMatch?.[1] ?? hrefAttr[1];
          const rawHash = pathMatch?.[2] ?? '';

          const absolutePath = rawPath?.startsWith('/')
            ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              app!.dirs.src.resolve('.' + rawPath)
            : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              resolveRelativePath(filePath!, rawPath);

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const route = filePathToRoute(app!, absolutePath);

          // Convert starting tag of internal link to `<RouterLink>`.
          token.tag = internalTag;
          // Replace the original `href` attr with `to` attr.
          hrefAttr[0] = 'to';
          // Set new path.
          hrefAttr[1] = route + rawHash;
          // Set `hasOpenInternalLink` to modify the ending tag.
          hasOpenInternalLink = true;
        }

        const links = env.links || (env.links = []);
        links.push(hrefAttr[1].replace(/\.html$/, ''));
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
