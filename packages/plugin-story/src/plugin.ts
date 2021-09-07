import type { Plugins } from '@vitebook/core';

import {
  loadAddonsVirtualModule,
  StoryAddonPlugin,
  StoryAddons,
  VIRTUAL_ADDONS_MODULE_ID
} from './addon.js';
import type { ResolvedStoryPage, ServerStoryPage } from './page.js';

export const PLUGIN_NAME = 'vitebook/plugin-story' as const;

export type StoryPluginOptions = {
  /**
   * Filter out which pages to be included as story pages.
   *
   * @default /\.story\.(mjs|js|ts|tsx|vue|svelte)$/
   */
  include?: RegExp;

  /**
   * Filter out which pages should _not_ be included as story pages.
   *
   * @default /$^/ - matches nothing.
   */
  exclude?: RegExp;

  /**
   * Story addon plugins.
   */
  addons?: StoryAddons;
};

const defaultIncludeRE = /\.story\.(mjs|js|ts|tsx|vue|svelte)$/;
const defaultExcludeRE = /$^/;

export function storyPlugin(options: StoryPluginOptions = {}): Plugins {
  const includeRE = options.include ?? defaultIncludeRE;
  const excludeRE = options.exclude ?? defaultExcludeRE;

  const filteredAddons = (options.addons ?? [])
    .flat()
    .filter((addon) => !!addon) as StoryAddonPlugin[];

  return [
    {
      name: PLUGIN_NAME,
      enforce: 'pre',
      async resolvePage(page): Promise<ResolvedStoryPage | void> {
        if (includeRE.test(page.filePath) && !excludeRE.test(page.filePath)) {
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
        if (id === VIRTUAL_ADDONS_MODULE_ID) {
          return id;
        }
      },
      load(id) {
        if (id === VIRTUAL_ADDONS_MODULE_ID) {
          return loadAddonsVirtualModule(filteredAddons);
        }
      }
    },
    ...filteredAddons
  ];
}
