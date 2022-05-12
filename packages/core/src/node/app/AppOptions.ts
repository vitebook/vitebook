import { CLIArgs } from '../cli/args';
import type { CorePluginOptions } from './plugins/core';
import type { MarkdownPluginOptions } from './plugins/markdown';
import { PagesPluginOptions } from './plugins/pages';
import type { Plugins } from './plugins/Plugin';

export type AppOptions = {
  /**
   * Parsed CLI arguments.
   */
  cliArgs: CLIArgs;

  /**
   * Application directory paths.
   */
  dirs: AppDirsOptions;

  /**
   * Core options.
   */
  core: CorePluginOptions;

  /**
   * Pages options.
   */
  pages: PagesPluginOptions;

  /**
   * Markdown options.
   */
  markdown: MarkdownPluginOptions;

  /**
   * Vitebook plugins.
   */
  plugins: Plugins;

  /**
   * Whether to load in debug mode.
   *
   * @default false
   */
  debug: boolean;
};

export type AppDirsOptions = {
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

export type AppConfig = Omit<Partial<AppOptions>, 'dirs'> & {
  dirs?: Partial<AppDirsOptions>;
};
