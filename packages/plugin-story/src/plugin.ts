import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { Plugin } from '@vitebook/core';

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
   * Filter out which files to be included as story pages.
   *
   * @default /\.story\.(mjs|js|ts|tsx|vue|svelte)$/
   */
  pages?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as story pages.
   *
   * @default undefined
   */
  pagesExclude?: FilterPattern;

  /**
   * Story addon plugins.
   */
  addons?: StoryAddons;
};

const defaultPagesRE = /\.story\.(mjs|js|ts|tsx|vue|svelte)$/;

export function storyPlugin(options: StoryPluginOptions = {}): Plugin[] {
  const pagesRE = options.pages ?? defaultPagesRE;
  const pagesFilter = createFilter(pagesRE, options.pagesExclude);

  const filteredAddons = (options.addons ?? [])
    .flat()
    .filter((addon) => !!addon) as StoryAddonPlugin[];

  return [
    {
      name: PLUGIN_NAME,
      enforce: 'pre',
      async resolvePage(page): Promise<ResolvedStoryPage | void> {
        if (pagesFilter(page.filePath)) {
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

        return null;
      },
      load(id) {
        if (id === VIRTUAL_ADDONS_MODULE_ID) {
          return loadAddonsVirtualModule(filteredAddons);
        }

        return null;
      }
    },
    ...filteredAddons
  ];
}
