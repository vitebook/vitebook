import type { FilterPattern } from '@rollup/pluginutils';

import type {
  PageRouteMatcherConfig,
  ServerLoadedOutputMap,
  ServerPage,
} from '../../shared';
import type {
  MarkdownPluginConfig,
  ResolvedMarkdownPluginConfig,
} from './plugins/markdown';
import type {
  PagesPluginConfig,
  ResolvedPagesPluginConfig,
} from './plugins/pages';

export type ResolvedAppConfig = {
  /** Application directory paths. */
  dirs: ResolvedAppDirsConfig;
  /** Client options. */
  client: ResolvedAppClientConfig;
  /** Routing options. */
  routes: ResolvedRouteConfig;
  /** Pages options. */
  pages: ResolvedPagesPluginConfig;
  /** Markdown options. */
  markdown: ResolvedMarkdownPluginConfig;
  /** Sitemap options. */
  sitemap: ResolvedSitemapConfig[];
  /** Whether app is running in debug mode.  */
  isDebug: boolean;
  /** Whether Vite is in build mode. */
  isBuild: boolean;
  /** Whether Vite is in SSR mode. */
  isSSR: boolean;
};

export type ResolvedRouteConfig = {
  /**
   * An array of pages to crawl from. The given path must be a valid route such as
   * `/getting-started/` or `/getting-started/intro.html` and a page must match.
   */
  entries: string[];
  /**
   * Route matchers are used to inject pattern matching into file paths. For example, a file
   * named `foo{int}.md` has a matcher named `int` which can then be defined at `routes.matchers`
   * in your Vitebook config. The `{int}` will be replaced with the string or Regex you provide.
   * You can provide multiple placeholders for a single file name or path.
   *
   * @example
   * ```js
   * const config = {
   *   routes: {
   *     matchers: {
   *       int: /\d+/,
   *     },
   *   },
   * };
   * ```
   */
  matchers: PageRouteMatcherConfig;
  /**
   * The route logging style.
   *
   * @defaultValue `tree`
   */
  log: RoutesLogStyle;
  /**
   * The route logging level is used by the logger to determine how much detail to include.
   *
   * - `info` - Logs all routes, redirects, and not found pages.
   * - `warn` - Only logs redirects and not found pages.
   * - `error` - Only logs not found pages.
   *
   * @defaultValue `warn`
   */
  logLevel: RoutesLogLevel;
};

export type RoutesLogLevel = 'info' | 'warn' | 'error';

export type RoutesLogStyle = 'none' | 'list' | 'tree' | CustomRoutesLogger;

export type CustomRoutesLogger = (
  input: CustomRoutesLoggerInput,
) => void | Promise<void>;

export type CustomRoutesLoggerInput = {
  /** Desired route logging level. */
  level: RoutesLogLevel;
  /** All found links and their respective server page. */
  links: Map<string, ServerPage>;
  /** Record containing links and their respective redirect. */
  redirects: Record<string, string>;
  /** Data hash table containing data asset id to hash value. */
  dataHashes: Record<string, string>;
  /** Set of 404 links that were found. */
  notFoundLinks: Set<string>;
  /** Map of links and their respective loaded server output (might be a redirect link). */
  serverOutput: Map<string, string | ServerLoadedOutputMap>;
};

export type RoutesConfig = Partial<ResolvedRouteConfig>;

export type ResolvedAppClientConfig = {
  /**
   * Application module ID or file path relative to `<root>`.
   */
  app: string;
  /**
   * Array of module ids that will be imported to configure the client-side application. The
   * module must export a `configureApp()` function.
   */
  configFiles: string[];
};

export type AppClientConfig = Partial<ResolvedAppClientConfig>;

export type ResolvedAppDirsConfig = {
  /**
   * Directory to serve as plain static assets. Files in this directory are served and copied to
   * build dist dir as-is without transform. The value can be either an absolute file system path
   * or a path relative to `<root>`.
   *
   * @default '<root>/public'
   */
  public: string;

  /**
   * Path to application pages directory. The value can be either an absolute file system path
   * or a path relative to `<root>`.
   *
   * @default '<root>/pages'
   */
  pages: string;

  /**
   * The build output directory. The value can be either an absolute file system path or a path
   * relative to `<root>`.
   *
   * @default '<root>/build'
   */
  output: string;
};

export type AppDirsConfig = Partial<ResolvedAppDirsConfig>;

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
   * The base url to use when building sitemap URL entries.
   *
   * @example 'http://mysite.com'
   * @defaultValue `null`
   */
  baseUrl: string | null;
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

export type AppConfig = Omit<
  Partial<ResolvedAppConfig>,
  'dirs' | 'client' | 'markdown' | 'pages' | 'routes' | 'sitemap'
> & {
  /** Application directory paths. */
  dirs?: AppDirsConfig;
  /** Client options. */
  client?: AppClientConfig;
  /** Routing options. */
  routes?: RoutesConfig;
  /** Pages options. */
  pages?: PagesPluginConfig;
  /** Markdown options. */
  markdown?: MarkdownPluginConfig;
  /** One or many sitemap configurations. */
  sitemap?: SitemapConfig | SitemapConfig[];
};
