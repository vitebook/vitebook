import { createFilter, FilterPattern } from '@rollup/pluginutils';
import { Options as SvelteOptions, svelte } from '@sveltejs/vite-plugin-svelte';
import type { Plugin } from '@vitebook/core/node';
import { ensureLeadingSlash } from '@vitebook/core/node';

import type { ResolvedSvelteServerPage } from '../shared';

export const PLUGIN_NAME = '@vitebook/plugin-svelte' as const;

export type SveltePluginOptions = {
  /**
   * Filter out which files to be included as svelte pages.
   *
   * @default /\.svelte($|\?)/
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as svelte pages.
   *
   * @default undefined
   */
  exclude?: FilterPattern;

  /**
   * `@sveltejs/vite-plugin-svelte` plugin options.
   *
   * @link https://github.com/sveltejs/vite-plugin-svelte
   */
  svelte?: SvelteOptions;
};

const DEFAULT_INCLUDE_RE = /\.svelte($|\?)/;

export function sveltePlugin(options: SveltePluginOptions = {}): Plugin[] {
  const filter = createFilter(
    options.include ?? DEFAULT_INCLUDE_RE,
    options.exclude
  );

  const sveltePlugin = svelte({
    ...options.svelte,
    include: options.svelte?.include ?? (options.include as string[])
  });

  return [
    {
      name: PLUGIN_NAME,
      enforce: 'pre',
      resolvePage({
        filePath,
        relativeFilePath
      }): ResolvedSvelteServerPage | null {
        if (filter(filePath)) {
          return {
            id: '@vitebook/plugin-svelte/client/SvelteAdapter.vue',
            type: 'svelte',
            context: {
              loader: `() => import('${ensureLeadingSlash(relativeFilePath)}')`
            }
          };
        }

        return null;
      }
    },
    // @ts-expect-error - Not compatible plugin type?
    sveltePlugin
  ];
}
