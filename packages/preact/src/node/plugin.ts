import preactPreset, {
  PreactPluginOptions as PreactPresetOptions,
} from '@preact/preset-vite';
import { createFilter, FilterPattern } from '@rollup/pluginutils';
import {
  App,
  ensureLeadingSlash,
  Plugin,
  VM_PREFIX,
} from '@vitebook/core/node';
import { fs, path } from '@vitebook/core/node/utils';

import type { ResolvedPreactServerPage } from '../shared';

export const PLUGIN_NAME = '@vitebook/preact' as const;

export type PreactPluginOptions = {
  /**
   * Path to Preact app file. The path can be absolute or relative to `<configDir>`.
   *
   * @default undefined
   */
  appFile?: string;

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

const VIRTUAL_APP_ID = `${VM_PREFIX}/preact/app`;
const VIRTUAL_APP_REQUEST_PATH = '/' + VIRTUAL_APP_ID;

export function preactPlugin(options: PreactPluginOptions = {}): Plugin[] {
  let app: App;

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
            alias: {
              [VIRTUAL_APP_ID]: VIRTUAL_APP_REQUEST_PATH,
            },
            dedupe: ['preact'],
          },
          esbuild: {
            jsxFactory: 'h',
            jsxFragment: 'Fragment',
          },
          optimizeDeps: {
            include: ['preact/jsx-runtime'],
          },
        };
      },
      configureApp(_app) {
        app = _app;
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
      resolveId(id) {
        if (id === VIRTUAL_APP_REQUEST_PATH) {
          const appFile = options.appFile;
          const path = appFile && app.dirs.config.resolve(appFile);
          return path && fs.existsSync(path) ? { id: path } : id;
        }

        return null;
      },
      load(id) {
        if (id === VIRTUAL_APP_REQUEST_PATH) {
          return `
function App({ component }) {
  return component;
}

App.displayName = 'VitebookApp';

export default App;
          `;
        }

        return null;
      },
    },
    ...preactPreset(options.preact),
  ];
}
