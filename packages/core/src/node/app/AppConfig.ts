import { type PageRouteMatcherConfig } from '../../shared';
import type { CLIArgs } from '../cli/args';
import type {
  CorePluginConfig,
  ResolvedCorePluginConfig,
} from './plugins/core';
import type {
  MarkdownPluginConfig,
  ResolvedMarkdownPluginConfig,
} from './plugins/markdown';
import type {
  PagesPluginConfig,
  ResolvedPagesPluginConfig,
} from './plugins/pages';
import type { FilteredPlugins, Plugins } from './plugins/Plugin';

export type ResolvedAppConfig = {
  /**
   * Parsed CLI arguments.
   */
  cliArgs: CLIArgs;

  /**
   * Application directory paths.
   */
  dirs: ResolvedAppDirsConfig;

  /**
   * Core options.
   */
  core: ResolvedCorePluginConfig;

  /**
   * Client options.
   */
  client: ResolvedAppClientConfig;

  /**
   * Routing options.
   */
  routes: ResolvedRouteConfig;

  /**
   * Pages options.
   */
  pages: ResolvedPagesPluginConfig;

  /**
   * Markdown options.
   */
  markdown: ResolvedMarkdownPluginConfig;

  /**
   * Vitebook plugins.
   */
  plugins: FilteredPlugins;

  /**
   * Whether to load in debug mode.
   *
   * @default false
   */
  debug: boolean;
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
};

export type RoutesConfig = Partial<ResolvedRouteConfig>;

export type ResolvedAppClientConfig = {
  /**
   * Application module ID or file path relative to `<root>`.
   */
  app: string | undefined;
  /**
   * Array of module ids that will be imported to configure the client-side application. The
   * module must export a `configureApp()` function.
   */
  configFiles: string[];
};

export type AppClientConfig = Partial<ResolvedAppClientConfig>;

export type ResolvedAppDirsConfig = {
  /**
   * Path to current working directory. The path can be absolute or relative to the current working
   * directory `process.cwd()`.
   *
   * @default 'process.cwd()'
   */
  cwd: string;

  /**
   * Path to project root directory. The path can be absolute or relative to the current working
   * directory `<cwd>`.
   *
   * @default '<cwd>'
   */
  root: string;

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

export type AppConfig = Omit<
  Partial<ResolvedAppConfig>,
  'dirs' | 'core' | 'client' | 'markdown' | 'pages' | 'plugins' | 'routes'
> & {
  dirs?: AppDirsConfig;
  core?: CorePluginConfig;
  client?: AppClientConfig;
  routes?: RoutesConfig;
  pages?: PagesPluginConfig;
  markdown?: MarkdownPluginConfig;
  plugins?: Plugins;
};
