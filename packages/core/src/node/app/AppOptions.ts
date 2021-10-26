import type { AliasOptions, UserConfig as ViteConfig } from 'vite';

import type { SiteConfig, ThemeConfig } from '../../shared';
import { CLIArgs } from '../cli/args';
import type { Plugins } from './plugin/Plugin';

export type AppOptions<Theme extends ThemeConfig = ThemeConfig> = {
  /**
   * Parsed CLI arguments.
   */
  cliArgs: CLIArgs;

  /**
   * Path to project root directory. The path can be absolute or relative to the current working
   * directory `process.cwd()`.
   *
   * @default process.cwd()
   */
  root: string;

  /**
   * Path to source code directory. The value can be either an absolute file system path
   * or a path relative to `<root>`.
   *
   * @default '<root>/src'
   */
  srcDir: string;

  /**
   * The Vitebook config directory. The value can be either an absolute file system path
   * or a path relative to `<root>`.
   *
   * @default '<root>/.vitebook'
   */
  configDir: string;

  /**
   * Directory to serve as plain static assets. Files in this directory are served and copied to
   * build dist dir as-is without transform. The value can be either an absolute file system path
   * or a path relative to `<configDir>`.
   *
   * @default '<configDir>/public'
   */
  publicDir: string;

  /**
   * The build output directory. The value can be either an absolute file system path or a path
   * relative to `<configDir>`.
   *
   * @default '<configDir>/dist'
   */
  outDir: string;

  /**
   * Globs pointing to files to be included in Vitebook (relative to `<root>`).
   *
   * @default []
   */
  include: string[];

  /**
   * Site-wide options for setting the base language, document title, description, locales, etc.
   */
  site: SiteConfig<Theme>;

  /**
   * Specifies an object, or an array of objects, which defines aliases used to replace values
   * in `import` or `require` statements. With either format, the order of the entries is important,
   * in that the first defined rules are applied first.
   *
   * Notes:
   *
   * - This is simply an alias for `vite.resolve.alias`.
   * - This is passed to `@rollup/plugin-alias` as the "entries" field.
   *
   * @link https://github.com/rollup/plugins/tree/master/packages/alias#entries
   */
  alias?: AliasOptions;

  /**
   * Options to pass on to `vite`.
   */
  vite: ViteConfig;

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

  /**
   * Cache directory. The value can be either an absolute file system path or a path
   * relative to `<configDir>`.
   *
   * @default '<configDir>/.cache'
   */
  cacheDir: string;

  /**
   * Temp directory. The value can be either an absolute file system path or a path
   * relative to `<configDir>`.
   *
   * @default '<configDir>/.temp'
   */
  tmpDir: string;

  /**
   * Function to map file paths to client routes such as `/button/button.story.ts` ->
   * `/button/button.html`.
   *
   * The route must resolve to a path ending with `.html`.
   */
  resolveRoute?: (path: {
    filePath: string;
    relativeFilePath: string;
  }) => string | null | undefined;
};

export type AppConfig<Theme extends ThemeConfig = ThemeConfig> = Partial<
  AppOptions<Theme>
>;
