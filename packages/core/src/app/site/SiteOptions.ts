import type { ThemePluginConfig } from '../plugin/ThemePlugin.js';
import type { HeadConfig } from './HeadConfig';
import type { LocaleConfig } from './LocaleConfig';

export type SiteOptions<Theme extends ThemePluginConfig = ThemePluginConfig> =
  SiteLocaleData & {
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
     * Name or absolute path of theme you want to use and it's respective configuration options.
     * The name can be a theme name, theme name shorthand, or absolute path to theme.
     *
     * The configuration options will vary depending on the theme you are using.
     *
     * @example 'vitebook-theme-foo'
     * @example 'foo'
     * @example path.resolve(__dirname, './path/to/local/theme')
     */
    theme: [string, Theme];

    /**
     * Localization config for site.
     */
    locales: SiteLocaleConfig;
  };

export type SiteConfig<Theme extends ThemePluginConfig = ThemePluginConfig> =
  Partial<SiteOptions<Theme>>;

export type SiteLocaleData = {
  /**
   * Language of the site as it should be set on the `html` element.
   *
   * @example 'en-US'
   * @example 'zh-CN'
   * @default 'en-US'
   */
  lang: string;

  /**
   * Title for the site. This will be the suffix for all page titles, and displayed in the navbar.
   *
   * @default 'Storyboard'
   */
  title: string;

  /**
   * Description for the site. This will render as a `<meta>` tag in the page HTML.
   *
   * @default 'A Storyboard site 🎨'
   */
  description: string;

  /**
   * Extra tags to inject into the `<head>` tag in the rendered HTML.
   */
  head: HeadConfig[];
};

/**
 * Site locale config.
 *
 * @example
 * {
 *   '/en/': {
 *     lang: 'en-US',
 *     title: 'Hello',
 *   },
 *   '/zh/: {
 *     lang: 'zh-CN',
 *     title: '你好',
 *   }
 * }
 */
export type SiteLocaleConfig = LocaleConfig<SiteLocaleData>;
