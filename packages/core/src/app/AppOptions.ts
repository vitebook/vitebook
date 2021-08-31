import type { UserConfig as ViteConfig } from 'vite';

import type { MarkdownOptions } from './markdown/Markdown.js';
import type { PluginConfig } from './plugin/Plugin.js';
import type { ThemeConfig } from './plugin/Theme.js';
import type { SiteConfig } from './site/SiteOptions.js';

export type AppOptions<Theme extends ThemeConfig = ThemeConfig> = {
  /**
   * The base URL the site will be deployed at. You will need to set this if you plan to deploy
   * your site under a sub path, for example, GitHub pages. If you plan to deploy your site to
   * `https://foo.github.io/bar/`, then you should set base to `'/bar/'`. It should always start
   * and end with a slash.
   *
   * The `base` is automatically prepended to all the URLs that start with `/` in other options,
   * so you only need to specify it once.
   *
   * @default '/'
   */
  baseUrl: string;

  /**
   * Directory to serve as plain static assets. Files in this directory are served and copied to
   * build dist dir as-is without transform. The value can be either an absolute file system path
   * or a path relative to `<root>`.
   *
   * Set to `false` or an empty string to disable copied static assets to build `dist` dir.
   *
   * @default 'public'
   */
  publicDir: string | false;

  /**
   * Path to directory where source code lives. The path can be absolute or relative to the
   * current working directory `process.cwd()`.
   *
   * @default 'src'
   */
  srcDir: string;

  /**
   * Globs pointing to page files to be included in Vitebook. These are relative to the `<srcDir>`.
   *
   * @default ['**\/*.md', '**\/*.{collection,story,stories}.{js,ts,tsx}']
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
  plugins: PluginConfig;
};

export type AppConfig = Partial<AppOptions>;

export type UserConfig = AppConfig;
