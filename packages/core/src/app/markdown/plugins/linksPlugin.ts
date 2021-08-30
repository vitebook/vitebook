import type { PluginWithOptions } from 'markdown-it';
import type * as Token from 'markdown-it/lib/token';

import { isLinkExternal } from '../../../utils/network.js';
import { resolvePaths } from '../../../utils/path.js';
import type { MarkdownEnv } from '../Markdown.js';

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
   * Whether to render an outbound icon to external links.
   *
   * @default true
   */
  externalIcon?: boolean;
};

/**
 * Process links in markdown file.
 *
 * - Internal links: convert them into `<RouterLink>`.
 * - External links: add extra attrs and external icon.
 */
export const linksPlugin: PluginWithOptions<LinksPluginOptions> = (
  md,
  options: LinksPluginOptions = {}
): void => {
  // Tag of internal links.
  const internalTag = options.internalTag || 'RouterLink';

  // Attrs that going to be added to external links.
  const externalAttrs = {
    target: '_blank',
    rel: 'noopener noreferrer',
    ...options.externalAttrs
  };

  // External icon.
  const externalIcon = options.externalIcon ?? true;

  let hasOpenInternalLink = false;
  let hasOpenExternalLink = false;

  const handleLinkOpen = (
    tokens: Token[],
    idx: number,
    env: MarkdownEnv
  ): void => {
    // Get current token.
    const token = tokens[idx];

    // Get `href` attr index.
    const hrefIndex = token.attrIndex('href');

    // If `href` attr does not exist, skip
    if (hrefIndex < 0) {
      return;
    }

    // If `href` attr exists, `token.attrs` is not `null`.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const hrefAttr = token.attrs![hrefIndex];
    const hrefLink = hrefAttr[1];

    // Get `base` and `filePathRelative` from `env`.
    const { baseUrl = '/', filePathRelative = null, frontmatter = {} } = env;

    // Check if a link is an external link.
    if (isLinkExternal(hrefLink, baseUrl)) {
      // set `externalAttrs` to current token
      Object.entries(externalAttrs).forEach(([key, val]) =>
        token.attrSet(key, val)
      );

      // Check if we should render external icon.
      if (
        // Frontmatter should override plugin option.
        (frontmatter.externalIcon ?? externalIcon) &&
        // Only when an external link has `target="_blank"` should we render external icon.
        externalAttrs.target === '_blank'
      ) {
        hasOpenExternalLink = true;
      }

      return;
    }

    // Check if a link is an internal link.
    const internalLinkMatch = hrefLink.match(
      /^((?:.*)(?:\/|\.md|\.html))(#.*)?$/
    );
    if (internalLinkMatch) {
      // convert
      // <a href="hrefLink">
      // to
      // <RouterLink to="toProp">

      // Notice that the path and hash are encoded by `markdown-it`.
      const rawPath = internalLinkMatch[1];
      const rawHash = internalLinkMatch[2] || '';

      // Resolve relative and absolute path.
      const { relativePath, absolutePath } = resolvePaths(
        rawPath,
        baseUrl,
        filePathRelative
      );

      /**
       * Normalize markdown file path to route path. We are removing the `base` from absolute
       * path because it should not bepassed to `<RouterLink>`.
       *
       * '/foo/index.md' => '/foo/'
       * '/foo/bar.md' => '/foo/bar.html'
       */
      const normalizedPath = absolutePath
        .replace(new RegExp(`^${baseUrl}`), '/')
        .replace(/(^|\/)(README|index).md$/i, '$1')
        .replace(/\.md$/, '.html');

      if (internalTag === 'RouterLink') {
        // Convert starting tag of internal link to `<RouterLink>`.
        token.tag = internalTag;
        // Replace the original `href` attr with `to` attr.
        hrefAttr[0] = 'to';
        // Set `hasOpenInternalLink` to modify the ending tag.
        hasOpenInternalLink = true;
      }

      hrefAttr[1] = `${normalizedPath}${rawHash}`;

      // Extract internal links for file/page existence check.
      const links = env.links || (env.links = []);
      links.push({
        raw: hrefLink,
        relative: relativePath,
        absolute: absolutePath
      });
    }
  };

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    handleLinkOpen(tokens, idx, env);
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.link_close = (tokens, idx, options, env, self) => {
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
