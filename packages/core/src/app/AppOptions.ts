import type { UserConfig as ViteConfig } from 'vite';

import type { MarkdownOptions } from './markdown/Markdown.js';
import type { PluginConfig } from './plugin/Plugin.js';
import type { ThemeConfig } from './plugin/Theme.js';
import type { SiteConfig } from './site/SiteOptions.js';

export type AppOptions<Theme extends ThemeConfig = ThemeConfig> = {
  /**
   * The current working directory.
   *
   * @default process.cwd()
   */
  cwd: string;

  /**
   * The Vitebook config directory. The value can be either an absolute file system path
   * or a path relative to `<cwd>`.
   *
   * @default '<cwd>/.vitebook'
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
   * Path to directory where source code lives. The path can be absolute or relative to the
   * current working directory current working directory (`cwd`).
   *
   * @default '<cwd>/src'
   */
  srcDir: string;

  /**
   * The build output directory. The value can be either an absolute file system path or a path
   * relative to `<configDir>`.
   *
   * @default '<configDir>/dist'
   */
  outDir: string;

  /**
   * Globs pointing to page files to be included in Vitebook. These are relative to the `<srcDir>`.
   *
   * @default ['**\/*.md', '**\/*.{story,stories}.{js,ts,tsx}']
   */
  pages: string[];

  /**
   * Site-wide options for setting the base language, document title, description, locales, etc.
   */
  site: SiteConfig<Theme>;

  /**
   * Markdown options to pass to `markdown-it`.
   *
   * @see https://github.com/markdown-it/markdown-it
   */
  markdown: MarkdownOptions;

  /**
   * Options to pass on to `vite`.
   */
  vite: ViteConfig;

  /**
   * General plugins to use and their respective configurations.
   */
  plugins: PluginConfig[];

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
};

export type AppConfig = Partial<AppOptions>;

export type UserConfig = AppConfig;
