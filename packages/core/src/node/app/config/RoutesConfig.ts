import type {
  RouteMatcherConfig,
  ServerLoadedOutputMap,
  ServerPage,
} from '../../../shared';

export type ResolvedRoutesConfig = {
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
  matchers: RouteMatcherConfig;
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
  /**
   * Page routing configuration object.
   */
  pages: {
    /**
     * Globs indicating page files to be included in Vitebook (relative to `<pages>`).
     */
    include: string[];
    /**
     * Globs or RegExp indicating page files to be excluded from Vitebook (relative to `<pages>`).
     */
    exclude: (string | RegExp)[];
  };
  /**
   * Layouts routing configuration object.
   */
  layouts: {
    /**
     * Globs indicating layout files to be included in Vitebook (relative to `<pages>`).
     */
    include: string[];
    /**
     * Globs or RegExp indicating layout files to be excluded from Vitebook (relative to `<pages>`).
     */
    exclude: (string | RegExp)[];
  };
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

export type RoutesConfig = Partial<
  Omit<ResolvedRoutesConfig, 'pages' | 'layouts'>
> & {
  pages?: Partial<ResolvedRoutesConfig['pages']>;
  layouts?: Partial<ResolvedRoutesConfig['pages']>;
};
