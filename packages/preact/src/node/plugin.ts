import prefresh, { Options as PreactOptions } from '@prefresh/vite';
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
   * `@prefresh/vite` plugin options.
   *
   * @link https://github.com/preactjs/prefresh/tree/main/packages/vite
   */
  prefresh?: PreactOptions;
};

const DEFAULT_INCLUDE_RE = /\.(jsx|tsx)($|\?)/;

export function preactPlugin(options: PreactPluginOptions = {}): Plugin[] {
  const filter = createFilter(
    options.include ?? DEFAULT_INCLUDE_RE,
    options.exclude
  );

  return [
    {
      name: PLUGIN_NAME,
      enforce: 'pre',
      config() {
        return {
          esbuild: {
            jsxFactory: 'h',
            jsxFragment: 'Fragment',
            jsxInject: `import { h, Fragment } from 'preact'`
          },
          resolve: {
            alias: {
              'react-dom': 'preact/compat',
              'react-dom/test-utils': 'preact/test-utils',
              react: 'preact/compat'
            }
          },
          optimizeDeps: {
            // Force include `preact` to avoid duplicated copies when linked + optimized.
            include: ['preact']
          }
        };
      },
      resolvePage({
        filePath,
        relativeFilePath
      }): ResolvedPreactServerPage | null {
        if (filter(filePath)) {
          return {
            id: '@vitebook/preact/PreactAdapter.svelte',
            type: `preact:${path.extname(filePath).slice(1) as 'jsx' | 'tsx'}`,
            context: {
              loader: `() => import('${ensureLeadingSlash(relativeFilePath)}')`
            }
          };
        }

        return null;
      }
    },
    prefresh(options.prefresh)
  ];
}
