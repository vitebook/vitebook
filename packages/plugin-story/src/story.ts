import type { HeadConfig, LocaleConfig } from '@vitebook/core';

export type StoryOptions<Component = unknown> = StoryLocaleData & {
  /**
   * Client-side story component (it can be dynamically imported).
   */
  component: Component | Promise<Component>;

  /**
   * Localization config.
   */
  locales: StoryLocaleConfig;
};

export type StoryConfig<Component = unknown> = Partial<StoryOptions<Component>>;

export type StoryLocaleData = {
  /**
   * Title of the story. This will render as a `<title>` tag in the HTML.
   *
   * @example 'Button'
   * @example 'Form Text Input'
   */
  title: string;

  /**
   * Description of the story. This will render as a `<meta>` tag in the HTML.
   *
   * @example 'My awesome button.'
   */
  description: string;

  /**
   * Extra tags to inject into the `<head>` tag in the rendered HTML.
   */
  head: HeadConfig[];
};

export type StoryLocaleConfig = LocaleConfig<StoryLocaleData>;
