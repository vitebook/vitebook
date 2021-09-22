import { resolvePaths } from '@vitebook/core/node/utils';
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

const INDEX_RE = /(^|.*\/)index.md(#?.*)$/i;
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
    const baseUrl = app.site.options.baseUrl;

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

          // Convert starting tag of internal link to `<RouterLink>`.
          token.tag = internalTag;
          // Replace the original `href` attr with `to` attr.
          hrefAttr[0] = 'to';
          // Resolve path relative to `<src>`
          let { absolutePath } = filePath
            ? resolvePaths(rawPath, baseUrl, app.dirs.src.relative(filePath))
            : { absolutePath: null };
          // Don't pass base to `<RouterLink />`
          absolutePath = (absolutePath ?? hrefAttr[1]).replace(
            new RegExp(`^${baseUrl}`),
            '/'
          );
          // Set new path.
          hrefAttr[1] = absolutePath + rawHash;
          // Set `hasOpenInternalLink` to modify the ending tag.
          hasOpenInternalLink = true;
        }

        normalizeHref(hrefAttr, env);
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

  function normalizeHref(
    hrefAttr: [string, string],
    env: MarkdownParserEnv
  ): string {
    let url = hrefAttr[1];

    const indexMatch = url.match(INDEX_RE);

    if (indexMatch) {
      const [, path, hash] = indexMatch;
      url = path + hash;
    } else {
      let cleanUrl = url.replace(/#.*$/, '').replace(/\?.*$/, '');

      // .md -> .html
      if (cleanUrl.endsWith('.md')) {
        cleanUrl = cleanUrl.replace(/\.md$/, '.html');
      }

      // ./foo -> ./foo.html
      if (!cleanUrl.endsWith('.html') && !cleanUrl.endsWith('/')) {
        cleanUrl += '.html';
      }

      const parsed = new URL(url, 'http://a.com');
      url = cleanUrl + parsed.search + parsed.hash;
    }

    // ensure leading . for relative paths
    if (!url.startsWith('/') && !/^\.\//.test(url)) {
      url = './' + url;
    }

    // export it for existence check
    const links = env.links || (env.links = []);
    links.push(url.replace(/\.html$/, ''));

    // markdown-it encodes the uri
    url = decodeURI(url);

    hrefAttr[1] = url;

    return url;
  }
};
