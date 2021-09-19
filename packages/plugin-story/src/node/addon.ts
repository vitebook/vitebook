import { Plugin, VM_PREFIX } from '@vitebook/core/node';
import {
  prettyJsonStr,
  stripImportQuotesFromJson
} from '@vitebook/core/shared';

import { ServerStoryPage } from '../shared/index';

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

export function loadAddonsVirtualModule(addons: StoryAddonPlugin[]): string {
  return `export default ${stripImportQuotesFromJson(
    prettyJsonStr(
      addons.map(({ addon }) => ({
        loader: `() => import('${addon}')`
      }))
    )
  )}`;
}
