import type { HeadConfig } from '../site/HeadConfig.js';
import type { LocaleConfig } from '../site/LocaleConfig.js';

export type StoryOptions = StoryLocaleData & {
  /**
   * Path to the component. Path can be an absolute system file path or a path relative to
   * the story file.
   *
   * @example './Button.jsx'
   * @example './Button.vue'
   */
  component: string;

  /**
   * Localization config.
   */
  locales: StoryLocaleConfig;
};

export type StoryConfig = Partial<StoryOptions>;

export type StoryLocaleData = {
  /**
   * The name of the story.
   *
   * @example 'Button'
   * @example 'Form Text Input'
   */
  name: string;

  /**
   * Describes the story.
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
