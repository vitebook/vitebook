import type { LocaleConfig, Plugin } from '@vitebook/core';
import { VM_PREFIX } from '@vitebook/core';
import {
  prettyJsonStr,
  stripImportQuotesFromJson
} from '@vitebook/core/utils/json.js';

import type { ServerStoryPage } from './page.js';

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

export type StoryAddonPlugin = Plugin & {
  /**
   * Absolute system file path to story addon module. Used client-side to dynamically load this
   * story addon. The referenced module should return a `StoryAddon` as it's default export.
   *
   * @see {StoryAddon}
   * @see {StoryAddonModule}
   */
  addon: string;

  /**
   * Called when story pages have been resolved. This will be called more than once as the user
   * makes changes to story files. This is called server-side.
   */
  onStoryPageResolved?(page: ServerStoryPage): void | Promise<void>;

  /**
   * Called when a story page has been removed. This is called server-side.
   */
  onStoryPageRemoved?(page: ServerStoryPage): void | Promise<void>;
};

export type StoryAddonOption = StoryAddonPlugin | false | null | undefined;
export type StoryAddons = (StoryAddonOption | StoryAddonOption[])[];

export const VIRTUAL_ADDONS_MODULE_ID =
  `${VM_PREFIX}/vitebook/plugin-story/addons` as const;

export const VIRTUAL_ADDONS_MODULE_REQUEST_PATH =
  `/${VIRTUAL_ADDONS_MODULE_ID}` as const;

export type StoryAddonModule<Component = unknown> = {
  default: StoryAddon<Component>;
};

export type VirtualStoryAddonsModule<Component = unknown> = {
  default: { loader: () => Promise<StoryAddonModule<Component>> }[];
};

export function loadAddonsVirtualModule(addons: StoryAddonPlugin[]): string {
  return `export default ${stripImportQuotesFromJson(
    prettyJsonStr(
      addons.map(({ addon }) => ({
        loader: `() => import('${addon}')`
      }))
    )
  )}`;
}
