import { createFilter } from '@rollup/pluginutils';
import fs from 'fs';

import { isFunction, type ServerPage, slash } from '../../../shared';
import type { App } from '../App';
import type { ResolvedSitemapConfig, SitemapURL } from '../config';

export async function buildSitemap(
  app: App,
  seenHref: Map<string, ServerPage>,
  config: ResolvedSitemapConfig,
) {
  const baseUrl = config.baseUrl;

  if (!baseUrl) return;

  const filter = createFilter(config.include, config.exclude);

  const changefreq = isFunction(config.changefreq)
    ? config.changefreq
    : () => config.changefreq;

  const priority = isFunction(config.priority)
    ? config.priority
    : () => config.priority;

  const lastmodCache = new Map<string, string>();
  const lastmod = async (pathname: string) => {
    if (lastmodCache.has(pathname)) return lastmodCache.get(pathname);
    const filePath = seenHref.get(pathname)!.filePath;
    const mtime = (await fs.promises.stat(filePath)).mtime;
    const date = mtime.toISOString().split('T')[0];
    lastmodCache.set(pathname, date);
    return date;
  };

  const urls = [
    ...(await Promise.all(
      Array.from(seenHref.keys())
        .filter(filter)
        .map(async (pathname) => ({
          path: pathname,
          lastmod: await lastmod(pathname),
          changefreq: await changefreq(new URL(pathname, baseUrl)),
          priority: await priority(new URL(pathname, baseUrl)),
        }))
        // @ts-expect-error - .
        .map(async (url) => buildSitemapURL(await url, baseUrl)),
    )),
    ...config.entries.map((url) => buildSitemapURL(url, baseUrl)),
  ].join('\n  ');

  const content = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="https://www.w3.org/1999/xhtml"
  xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
>
  ${urls}
</urlset>`;

  await app.dirs.out.write(config.filename, content);
}

export function buildSitemapURL(url: SitemapURL, baseUrl = '/') {
  const lastmod = url.lastmod
    ? `\n    <lastmod>${url.lastmod ?? ''}</lastmod>`
    : '';

  return `<url>
    <loc>${baseUrl}${slash(url.path)}</loc>${lastmod}
    <changefreq>${url.changefreq ?? 'weekly'}</changefreq>
    <priority>${url.priority ?? 0.7}</priority>
  </url>`;
}
