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
  'dirs' | 'core' | 'client' | 'markdown' | 'pages' | 'plugins' | 'router'
> & {
  dirs?: AppDirsConfig;
  core?: CorePluginConfig;
  client?: AppClientConfig;
  markdown?: MarkdownPluginConfig;
  pages?: PagesPluginConfig;
  plugins?: Plugins;
};
