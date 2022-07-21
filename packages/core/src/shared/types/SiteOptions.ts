import type { HeadConfig } from './HeadConfig';
import type { LocaleConfig } from './LocaleConfig';
import { ThemeConfig } from './Theme';

export type SiteOptions<Theme extends ThemeConfig = ThemeConfig> =
  SiteLocaleData & {
    /** Plugin extensions. */
    [optionName: string]: unknown;

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
     * Theme configuration options which will vary depending on the theme you are using.
     */
    theme: Theme;

    /**
     * Localization config for site.
     */
    locales: SiteLocaleConfig;
  };

export type SiteConfig<Theme extends ThemeConfig = ThemeConfig> = Partial<
  SiteOptions<Theme>
>;

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
   * Label for the language as it should be displayed to the user.
   *
   * @default ''
   */
  langLabel: string;

  /**
   * Title for the site. This will be the suffix for all page titles, and displayed in the navbar.
   *
   * @default ''
   */
  title: string;

  /**
   * Description for the site. This will render as a `<meta>` tag in the page HTML.
   *
   * @default ''
   */
  description: string;

  /**
   * Extra tags to inject into the `<head>` tag in the rendered HTML.
   *
   * @default []
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

export type VirtualSiteDataModule<Theme extends ThemeConfig = ThemeConfig> = {
  default: SiteOptions<Theme>;
  [Symbol.toStringTag]: 'Module';
};
