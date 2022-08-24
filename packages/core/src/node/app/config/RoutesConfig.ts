import type { RouteMatcherConfig } from '../../../shared';
import type { BuildData } from '../build';

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
     * Globs indicating page files to be included in Vitebook (relative to `<app>`).
     */
    include: string[];
    /**
     * Globs or RegExp indicating page files to be excluded from Vitebook (relative to `<app>`).
     */
    exclude: (string | RegExp)[];
  };
  /**
   * Layouts routing configuration object.
   */
  layouts: {
    /**
     * Globs indicating layout files to be included in Vitebook (relative to `<app>`).
     */
    include: string[];
    /**
     * Globs or RegExp indicating layout files to be excluded from Vitebook (relative to `<app>`).
     */
    exclude: (string | RegExp)[];
  };
  functions: {
    /**
     * Globs indicating serverless/edge functions to be included in Vitebook (relative to `<app>`).
     */
    include: string[];
    /**
     * Globs or RegExp indicating serverless/edge functions to be excluded from Vitebook (relative
     * to `<app>`).
     */
    exclude: (string | RegExp)[];
  };
};

export type RoutesLogLevel = 'info' | 'warn' | 'error';

export type RoutesLogStyle = 'none' | 'list' | 'tree' | CustomRoutesLogger;

export type CustomRoutesLogger = (
  input: RoutesLoggerInput,
) => void | Promise<void>;

export type RoutesLoggerInput = {
  /** Desired route logging level. */
  level: RoutesLogLevel;
} & BuildData;

export type RoutesConfig = Partial<
  Omit<ResolvedRoutesConfig, 'pages' | 'layouts' | 'functions'>
> & {
  pages?: Partial<ResolvedRoutesConfig['pages']>;
  layouts?: Partial<ResolvedRoutesConfig['layouts']>;
  functions?: Partial<ResolvedRoutesConfig['functions']>;
};
