import { createFilter, FilterPattern } from '@rollup/pluginutils';
import {
  Options as SvelteOptions,
  PreprocessorGroup,
  svelte
} from '@sveltejs/vite-plugin-svelte';
import { ClientPlugin, isArray, Plugin } from '@vitebook/core/node';
import { path } from '@vitebook/core/node/utils';
import MagicString from 'magic-string';
import {
  compile as svelteCompile,
  parse,
  preprocess,
  walk
} from 'svelte/compiler';
import {
  Options as TypescriptOptions,
  typescript
} from 'svelte-preprocess-esbuild';

import type { PageAddonPlugin, PageAddons } from '../shared';
import {
  loadAddonsVirtualModule,
  VIRTUAL_ADDONS_MODULE_ID,
  VIRTUAL_ADDONS_MODULE_REQUEST_PATH
} from './addon';

export const PLUGIN_NAME = '@vitebook/client' as const;

export type ClientPluginOptions = {
  /**
   * Page addon plugins.
   */
  addons?: PageAddons[];

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

  /**
   * `svelte-preprocess-esbuild` preprocessor options.
   *
   * @link https://github.com/lukeed/svelte-preprocess-esbuild
   */
  typescript?: TypescriptOptions;

  /**
   * Applies a CSS class to all elements in included `.svelte` files to enable scoped styling. This
   * is to avoid theme styles affecting user components in pages/stories.
   */
  themeScope?: Omit<ThemeScopeOptions, 'preprocessors'>;
};

const DEFAULT_INCLUDE_RE = /\.svelte($|\?)/;
const DEFAULT_THEME_SCOPE_CLASS = '__vbk__';

const DEFAULT_THEME_SCOPE_INCLUDE = [
  /@vitebook\/client/,
  /@vitebook\/theme-default/,
  // The following regex's are for monorepo environments due to packages being linked.
  new RegExp(path.dirname(require.resolve('@vitebook/client')))
];

try {
  DEFAULT_THEME_SCOPE_INCLUDE.push(
    new RegExp(path.dirname(require.resolve('@vitebook/theme-default')))
  );

  DEFAULT_THEME_SCOPE_INCLUDE.push(
    new RegExp(
      path.resolve(
        path.dirname(require.resolve('@vitebook/theme-default')),
        '../../dist/icons'
      )
    )
  );
} catch (e) {
  //  ...
}

const SVG_ID_RE = /\.svg($|\?)/;
const RAW_ID_RE = /(\?|&)raw/;
const RAW_SVELTE_ID_RE = /(\?|&)raw&svelte/;

export function clientPlugin(
  options: ClientPluginOptions = {}
): [ClientPlugin, ...Plugin[]] {
  const filter = createFilter(
    options.include ?? DEFAULT_INCLUDE_RE,
    options.exclude
  );

  let themeScopeFilter: (id: unknown) => boolean;

  const filteredAddons = (options.addons ?? [])
    .flat()
    .filter((addon) => !!addon) as PageAddonPlugin[];

  const userPreprocessors = isArray(options.svelte?.preprocess)
    ? options.svelte!.preprocess
    : [options.svelte?.preprocess ?? {}];

  const preprocessors = [
    typescript({
      // Silence `esbuild` warning if `tsconfig` not found.
      tsconfigRaw:
        !options.typescript?.tsconfig && !options.typescript?.tsconfigRaw
          ? { compilerOptions: {} }
          : options.typescript?.tsconfigRaw,
      ...options.typescript
    }),
    ...userPreprocessors
  ];

  return [
    {
      name: PLUGIN_NAME,
      enforce: 'pre',
      entry: {
        client: require.resolve(`${PLUGIN_NAME}/entry-client.ts`),
        server: require.resolve(`${PLUGIN_NAME}/entry-server.ts`)
      },
      configureApp(app) {
        DEFAULT_THEME_SCOPE_INCLUDE.push(new RegExp(app.dirs.theme.path));

        themeScopeFilter = createFilter(
          options.themeScope?.include ?? DEFAULT_THEME_SCOPE_INCLUDE,
          options.themeScope?.exclude
        );

        app.context.themeScopeClass =
          options.themeScope?.scopeClass ?? DEFAULT_THEME_SCOPE_CLASS;

        const sveltePlugin = svelte({
          ...options.svelte,
          preprocess: [
            ...preprocessors,
            themeScope({ ...options.themeScope, preprocessors })
          ],
          compilerOptions: {
            ...options.svelte?.compilerOptions,
            hydratable: app.env.isProd
          }
        });

        app.plugins.push(sveltePlugin);
      },
      config() {
        return {
          resolve: {
            alias: {
              [VIRTUAL_ADDONS_MODULE_ID]: VIRTUAL_ADDONS_MODULE_REQUEST_PATH
            }
          }
        };
      },
      resolvePage({ filePath }) {
        if (filter(filePath)) {
          return {
            type: 'svelte'
          };
        }

        return null;
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
      },
      transform(code, id) {
        // Transform raw SVG's into Svelte components.
        if (SVG_ID_RE.test(id) && RAW_SVELTE_ID_RE.test(id)) {
          const content = JSON.parse(code.replace('export default', ''));
          return svelteCompile(content).js;
        }

        // TODO: bound to break at some point, we'll fix it later.
        if (SVG_ID_RE.test(id) && RAW_ID_RE.test(id) && themeScopeFilter(id)) {
          let content = JSON.parse(code.replace('export default', ''));
          content = content.replace(
            /<svg/g,
            `<svg class="${
              options.themeScope?.scopeClass ?? DEFAULT_THEME_SCOPE_CLASS
            }"`
          );
          return `export default ${JSON.stringify(content)}`;
        }

        return null;
      }
    },
    ...filteredAddons
  ];
}

export type ThemeScopeOptions = {
  /**
   *
   * @default '__vbk__'
   */
  scopeClass?: string;
  /**
   * Svelte files to be included. All elements in these files will have the theme scope class
   * applied to them.
   *
   * @default ['@vitebook/client', '@vitebook/theme-default']
   */
  include?: FilterPattern;
  /**
   * Svelte files to be excluded from theme scoping.
   *
   * @default undefined
   */
  exclude?: FilterPattern;
  /**
   * Svelte preprocessors.
   */
  preprocessors?: PreprocessorGroup[];
};

export type AddThemeScopeOptions = {
  content: string;
  filename: string;
  scopeClass?: string;
};

function addThemeScope({
  content,
  filename,
  scopeClass = DEFAULT_THEME_SCOPE_CLASS
}: AddThemeScopeOptions) {
  const mcs = new MagicString(content);
  const ast = parse(content, { filename });

  walk(ast, {
    enter(node) {
      if (node.type === 'Element') {
        mcs.overwrite(
          node.start,
          node.start + node.name.length + 1,
          `<${node.name} class:${scopeClass}={true} `
        );
      }
    }
  });

  return {
    code: mcs.toString(),
    map: mcs.generateMap({ source: filename }).toString()
  };
}

function themeScope({
  scopeClass,
  include = DEFAULT_THEME_SCOPE_INCLUDE,
  exclude,
  preprocessors = []
}: ThemeScopeOptions = {}): PreprocessorGroup {
  const filter = createFilter(include, exclude);

  return {
    // @ts-expect-error - can return `undefined`.
    async markup({ content, filename }) {
      if (filter(filename)) {
        // TODO: inefficiently running `preprocess` twice each time changes are made, need to
        // run them sequentially and once. Not a priority at the moment.
        const processedContent = await preprocess(content, preprocessors, {
          filename
        });

        return addThemeScope({
          filename,
          content: processedContent.code,
          scopeClass
        });
      }
    }
  };
}
