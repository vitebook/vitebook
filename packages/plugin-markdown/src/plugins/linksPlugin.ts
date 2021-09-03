/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { isLinkExternal } from '@vitebook/core/utils/url.js';
import type { PluginWithOptions } from 'markdown-it';

import type { MarkdownParserEnv } from '../Markdown.js';

export type LinksPluginOptions = {
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
};

const indexRE = /(^|.*\/)index.md(#?.*)$/i;

/**
 * Resolves link URLs.
 */
export const linksPlugin: PluginWithOptions<LinksPluginOptions> = (
  md,
  linkOptions: LinksPluginOptions = {}
): void => {
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex('href');
    if (hrefIndex >= 0) {
      const hrefAttr = token.attrs![hrefIndex];
      const url = hrefAttr[1];
      const isExternal = isLinkExternal(url);
      if (isExternal) {
        Object.entries(linkOptions.externalAttrs ?? {}).forEach(
          ([key, val]) => {
            token.attrSet(key, val);
          }
        );
      } else if (
        // internal anchor links
        !url.startsWith('#') &&
        // mail links
        !url.startsWith('mailto:')
      ) {
        normalizeHref(hrefAttr, env);
      }
    }
    return self.renderToken(tokens, idx, options);
  };

  function normalizeHref(hrefAttr: [string, string], env: MarkdownParserEnv) {
    let url = hrefAttr[1];

    const indexMatch = url.match(indexRE);

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
    hrefAttr[1] = decodeURI(url);
  }
};
