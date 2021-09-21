import type { HeadConfig } from './HeadConfig';
import type { LocaleConfig } from './LocaleConfig';

export type PageMeta = PageMetaLocaleData & {
  /**
   * Localization config.
   */
  locales?: PageMetaLocaleConfig;
};

export type PageMetaLocaleData = {
  /**
   * Title of the page. This will render as a `<title>` tag in the HTML.
   *
   * @example 'Button'
   * @example 'Form Text Input'
   */
  title?: string;

  /**
   * Description of the page. This will render as a `<meta>` tag in the HTML.
   *
   * @example 'My awesome button.'
   */
  description?: string;

  /**
   * Extra tags to inject into the `<head>` tag in the rendered HTML.
   */
  head?: HeadConfig[];
};

export type PageMetaLocaleConfig = LocaleConfig<PageMetaLocaleData>;
