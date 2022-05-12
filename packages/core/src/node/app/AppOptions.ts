import { CLIArgs } from '../cli/args';
import type { Plugins } from './plugin/Plugin';
import type { MarkdownPluginOptions } from './vite/plugins/markdownPlugin';

export type AppOptions = {
  /**
   * Parsed CLI arguments.
   */
  cliArgs: CLIArgs;

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
   * Path to application pages directory. The value can be either an absolute file system path
   * or a path relative to `<root>`.
   *
   * @default '<root>/pages'
   */
  pages: string;

  /**
   * Directory to serve as plain static assets. Files in this directory are served and copied to
   * build dist dir as-is without transform. The value can be either an absolute file system path
   * or a path relative to `<root>`.
   *
   * @default '<root>/public'
   */
  public: string;

  /**
   * The build output directory. The value can be either an absolute file system path or a path
   * relative to `<root>`.
   *
   * @default '<root>/build'
   */
  output: string;

  /**
   * Globs pointing to files to be included in Vitebook (relative to `<pages>`).
   *
   * @default ['**\/[^_]*.{svelte,md}']
   */
  include: string[];

  /**
   * Markdown options.
   */
  markdown: MarkdownPluginOptions;

  /**
   * General plugins to use and their respective configurations.
   */
  plugins: Plugins;

  /**
   * Whether to load in debug mode.
   *
   * @default false
   */
  debug: boolean;
};

export type AppConfig = Partial<AppOptions>;
