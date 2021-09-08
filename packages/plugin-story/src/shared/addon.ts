import type { LocaleConfig } from '@vitebook/core/shared';

export type StoryAddon<Component = unknown> = StoryAddonLocaleData & {
  /**
   * Returns icon file (it can be dynamically imported).
   */
  icon: () => string | (() => Promise<string>);

  /**
   * Returns icon file when dark theme is enabled (it can be dynamically imported).
   */
  iconDark?: string | (() => Promise<string>);

  /**
   * Returns client-side addon component (it can be dynamically imported).
   */
  component: Component | (() => Promise<Component>);

  /**
   * Localization config.
   */
  locales?: StoryAddonLocaleConfig;
};

export type StoryAddonLocaleData = {
  /**
   * Title of the story addon.
   */
  title: string;

  /**
   * Description of the story addon.
   */
  description: string;
};

export type StoryAddonLocaleConfig = LocaleConfig<StoryAddonLocaleData>;

export type StoryAddonModule<Component = unknown> = {
  default: StoryAddon<Component>;
};

export type VirtualStoryAddonsModule<Module extends StoryAddonModule> = {
  default: { loader: () => Promise<Module> }[];
};
