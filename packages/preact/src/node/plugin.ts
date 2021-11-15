import preactPreset, {
  PreactPluginOptions as PreactPresetOptions,
} from '@preact/preset-vite';
import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { Plugin } from '@vitebook/core/node';
import { ensureLeadingSlash } from '@vitebook/core/node';
import { path } from '@vitebook/core/node/utils';

import type { ResolvedPreactServerPage } from '../shared';

export const PLUGIN_NAME = '@vitebook/preact' as const;

export type PreactPluginOptions = {
  /**
   * Filter out which files to be included as preact/react pages.
   *
   * @default /\.(jsx|tsx)($|\?)/
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as preact/react pages.
   *
   * @default undefined
   */
  exclude?: FilterPattern;

  /**
   * `@preact/preset-vite` plugin options.
   *
   * @link https://github.com/preactjs/preset-vite
   */
  preact?: PreactPresetOptions & {
    include?: FilterPattern;
    exclude?: FilterPattern;
  };
};

const DEFAULT_INCLUDE_RE = /\.(jsx|tsx)($|\?)/;

export function preactPlugin(options: PreactPluginOptions = {}): Plugin[] {
  const filter = createFilter(
    options.include ?? DEFAULT_INCLUDE_RE,
    options.exclude,
  );

  return [
    {
      name: PLUGIN_NAME,
      enforce: 'pre',
      config() {
        return {
          resolve: {
            dedupe: [
              'preact',
              '@prefresh/core',
              '@prefresh/vite',
              '@prefresh/utils',
            ],
          },
          esbuild: {
            jsxFactory: 'h',
            jsxFragment: 'Fragment',
          },
          optimizeDeps: {
            exclude: [
              'preact',
              '@prefresh/core',
              '@prefresh/vite',
              '@prefresh/utils',
            ],
          },
        };
      },
      resolvePage({
        filePath,
        relativeFilePath,
      }): ResolvedPreactServerPage | null {
        if (filter(filePath)) {
          return {
            id: '@vitebook/preact/PreactPageView.svelte',
            type: `preact:${path.extname(filePath).slice(1) as 'jsx' | 'tsx'}`,
            context: {
              loader: `() => import('${ensureLeadingSlash(relativeFilePath)}')`,
            },
          };
        }

        return null;
      },
    },
    ...preactPreset(options.preact),
  ];
}
