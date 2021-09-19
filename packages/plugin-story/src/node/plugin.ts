import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { Plugin } from '@vitebook/core/node';

import type { ResolvedStoryPage, ServerStoryPage } from '../shared/index';
import {
  loadAddonsVirtualModule,
  StoryAddonPlugin,
  StoryAddons,
  VIRTUAL_ADDONS_MODULE_ID,
  VIRTUAL_ADDONS_MODULE_REQUEST_PATH
} from './addon';

export const PLUGIN_NAME = 'vitebook/plugin-story' as const;

export type StoryPluginOptions = {
  /**
   * Filter out which files to be included as story pages.
   *
   * @default /\.story\.(mjs|js|ts|tsx|vue|svelte)$/
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as story pages.
   *
   * @default undefined
   */
  exclude?: FilterPattern;

  /**
   * Story addon plugins.
   */
  addons?: StoryAddons;
};

const DEFAULT_INCLUDE = /\.story\.(mjs|js|ts|tsx|vue|svelte)$/;

export function storyPlugin(options: StoryPluginOptions = {}): Plugin[] {
  const filter = createFilter(
    options.include ?? DEFAULT_INCLUDE,
    options.exclude
  );

  const filteredAddons = (options.addons ?? [])
    .flat()
    .filter((addon) => !!addon) as StoryAddonPlugin[];

  return [
    {
      name: PLUGIN_NAME,
      enforce: 'pre',
      config() {
        return {
          resolve: {
            alias: {
              [VIRTUAL_ADDONS_MODULE_ID]: VIRTUAL_ADDONS_MODULE_REQUEST_PATH
            }
          }
        };
      },
      async resolvePage(page): Promise<ResolvedStoryPage | void> {
        if (filter(page.filePath)) {
          return {
            type: 'story'
          };
        }
      },
      async pagesResolved(pages: ServerStoryPage[]) {
        for (const page of pages) {
          if (page.type === 'story') {
            for (const addon of filteredAddons) {
              await addon.onStoryPageResolved?.(page);
            }
          }
        }
      },
      async pagesRemoved(pages: ServerStoryPage[]) {
        for (const page of pages) {
          if (page.type === 'story') {
            for (const addon of filteredAddons) {
              await addon.onStoryPageRemoved?.(page);
            }
          }
        }
      },
      resolveId(id) {
        if (id === VIRTUAL_ADDONS_MODULE_REQUEST_PATH) {
          return id;
        }

        return null;
      },
      load(id) {
        if (id === VIRTUAL_ADDONS_MODULE_REQUEST_PATH) {
          return loadAddonsVirtualModule(filteredAddons);
        }

        return null;
      }
    },
    ...filteredAddons
  ];
}
