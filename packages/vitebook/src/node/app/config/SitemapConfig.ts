import type { FilterPattern } from '@rollup/pluginutils';

export type SitemapChangeFrequency =
  | 'never'
  | 'yearly'
  | 'monthly'
  | 'weekly'
  | 'daily'
  | 'hourly'
  | 'always';

export type SitemapPriority = number;

export type ResolvedSitemapConfig = {
  /**
   * The URL origin to use when building sitemap URL entries.
   *
   * @example 'http://mysite.com'
   * @defaultValue `null`
   */
  origin: string | null;
  /**
   * Filtern pattern used to determine which HTML pages to include in final sitemap.
   *
   * @defaultValue `.*`
   */
  include: FilterPattern;
  /**
   * Filtern pattern used to determine which HTML pages to exclude from final sitemap.
   *
   * @defaultValue `null`
   */
  exclude: FilterPattern;
  /**
   * Sitemap file name which is output relative to application `<output>` directory.
   *
   * @defaultValue `sitemap.xml`
   */
  filename: string;
  /**
   * How frequently the page is likely to change. This value provides general information to
   * search engines and may not correlate exactly to how often they crawl the page.
   *
   * @defaultValue `'weekly'`
   * @see {@link https://www.sitemaps.org/protocol.html}
   */
  changefreq:
    | SitemapChangeFrequency
    | ((url: URL) => SitemapChangeFrequency | Promise<SitemapChangeFrequency>);
  /**
   * The priority of this URL relative to other URLs on your site. Valid values range from `0.0` to
   * `1.0`. This value does not affect how your pages are compared to pages on other sites — it
   * only lets the search engines know which pages you deem most important for the crawlers.
   *
   * @defaultValue `0.7`
   * @see {@link https://www.sitemaps.org/protocol.html}
   */
  priority:
    | SitemapPriority
    | ((url: URL) => SitemapPriority | Promise<SitemapPriority>);
  /**
   * Additional sitemap URLS to be included.
   */
  entries: SitemapURL[];
};

export type SitemapURL = {
  path: string;
  lastmod?: string;
  changefreq?: SitemapChangeFrequency;
  priority?: SitemapPriority;
};

export type SitemapConfig = Partial<ResolvedSitemapConfig>;
