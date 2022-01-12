import remapping from '@ampproject/remapping';
import {
  DecodedSourceMap,
  RawSourceMap,
  SourceMapLoader,
} from '@ampproject/remapping/dist/types/types';
import { createFilter, FilterPattern } from '@rollup/pluginutils';
import {
  Options as SvelteOptions,
  PreprocessorGroup,
  svelte,
} from '@sveltejs/vite-plugin-svelte';
import {
  App,
  ClientPlugin,
  isArray,
  Plugin,
  VM_PREFIX,
} from '@vitebook/core/node';
import { fs, path } from '@vitebook/core/node/utils';
import MagicString from 'magic-string';
import { compile as svelteCompile, parse, walk } from 'svelte/compiler';

export const PLUGIN_NAME = '@vitebook/client' as const;

export type ClientPluginOptions = {
  /**
   * Path to Svelte app file. The path can be absolute or relative to `<configDir>`.
   *
   * @default undefined
   */
  appFile?: string;

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
   * Applies a CSS class to all elements in included `.svelte` files to enable scoped styling. This
   * is to avoid theme styles affecting user components in pages/stories.
   */
  themeScope?: Omit<ThemeScopeOptions, 'preprocessors'>;
};

const VIRTUAL_APP_ID = `${VM_PREFIX}/client/app`;
const VIRTUAL_APP_REQUEST_PATH = '/' + VIRTUAL_APP_ID;

const DEFAULT_INCLUDE_RE = /\.svelte($|\?)/;
const DEFAULT_THEME_SCOPE_CLASS = '__vbk__';

const DEFAULT_THEME_SCOPE_INCLUDE = [
  /@vitebook\/client/,
  /@vitebook\/theme-default/,
  /@vitebook\/preact/,
  /@vitebook\/vue/,
  // The following regex's are for monorepo environments due to packages being linked.
  /vitebook\/packages\/client/,
  /vitebook\/packages\/preact/,
  /vitebook\/packages\/vue/,
  /vitebook\/packages\/theme-default/,
];

try {
  DEFAULT_THEME_SCOPE_INCLUDE.push(
    new RegExp(path.dirname(require.resolve('@vitebook/preact'))),
  );
} catch (e) {
  //
}

try {
  DEFAULT_THEME_SCOPE_INCLUDE.push(
    new RegExp(path.dirname(require.resolve('@vitebook/vue'))),
  );
} catch (e) {
  //
}

try {
  DEFAULT_THEME_SCOPE_INCLUDE.push(
    new RegExp(path.dirname(require.resolve('@vitebook/theme-default'))),
  );

  DEFAULT_THEME_SCOPE_INCLUDE.push(
    new RegExp(
      path.resolve(
        path.dirname(require.resolve('@vitebook/theme-default')),
        '../../dist/icons',
      ),
    ),
  );
} catch (e) {
  //  ...
}

const PNG_RE = /\.png($|\?)/;
const JPEG_RE = /\.jpeg($|\?)/;
const MP3_RE = /\.mp3($|\?)/;
const MP4_RE = /\.mp4($|\?)/;
const SVG_ID_RE = /\.svg($|\?)/;
const RAW_ID_RE = /(\?|&)raw/;
const RAW_SVELTE_ID_RE = /(\?|&)raw&svelte/;

export function clientPlugin(
  options: ClientPluginOptions = {},
): [ClientPlugin, ...Plugin[]] {
  let app: App;

  const filter = createFilter(
    options.include ?? DEFAULT_INCLUDE_RE,
    options.exclude,
  );

  let themeScopeFilter: (id: unknown) => boolean;

  const userPreprocessors = isArray(options.svelte?.preprocess)
    ? options.svelte!.preprocess
    : [options.svelte?.preprocess ?? {}];

  const preprocessors = [...userPreprocessors];

  return [
    {
      name: PLUGIN_NAME,
      enforce: 'pre',
      entry: {
        client: require.resolve(`${PLUGIN_NAME}/entry-client.js`),
        server: require.resolve(`${PLUGIN_NAME}/entry-server.js`),
      },
      configureApp(_app) {
        app = _app;

        DEFAULT_THEME_SCOPE_INCLUDE.push(new RegExp(app.dirs.theme.path));

        themeScopeFilter = createFilter(
          options.themeScope?.include ?? DEFAULT_THEME_SCOPE_INCLUDE,
          options.themeScope?.exclude,
        );

        app.context.themeScopeClass =
          options.themeScope?.scopeClass ?? DEFAULT_THEME_SCOPE_CLASS;

        preprocessors.push(themeScope(options.themeScope), staticifyMarkdown());

        const sveltePlugin = svelte({
          ...options.svelte,
          preprocess: [
            {
              async markup({ content, filename }) {
                let code = content;
                const sourcemaps: Array<DecodedSourceMap | RawSourceMap> = [];

                for (const preprocessor of preprocessors) {
                  const markup = await preprocessor.markup?.({
                    content: code,
                    filename,
                  });

                  const map = markup?.map
                    ? typeof markup.map === 'string'
                      ? JSON.parse(markup.map)
                      : markup.map
                    : undefined;

                  if (markup?.map) {
                    sourcemaps.unshift(map);
                  }

                  code = markup?.code ?? code;
                }

                return {
                  code,
                  map: combineSourcemaps(filename, sourcemaps),
                };
              },
            },
            ...preprocessors.map((p) => ({
              ...p,
              markup: undefined, // We run markup preprocessing sequentailly above.
            })),
          ],
          compilerOptions: {
            ...options.svelte?.compilerOptions,
            hydratable: app.env.isProd,
          },
        });

        app.plugins.push(sveltePlugin);
      },
      config() {
        return {
          resolve: {
            alias: {
              [VIRTUAL_APP_ID]: VIRTUAL_APP_REQUEST_PATH,
            },
          },
        };
      },
      resolvePage({ filePath }) {
        if (filter(filePath)) {
          const type = path.extname(filePath).slice(1);
          return {
            type: type === 'svelte' ? 'svelte' : `svelte:${type}`,
          };
        }

        return null;
      },
      resolveId(id) {
        if (id === VIRTUAL_APP_REQUEST_PATH) {
          const appFile = options.appFile;
          const path = appFile && app.dirs.config.resolve(appFile);
          return path && fs.existsSync(path)
            ? { id: path }
            : { id: require.resolve('@vitebook/client/app') };
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
            }"`,
          );
          return `export default ${JSON.stringify(content)}`;
        }

        if ((PNG_RE.test(id) || JPEG_RE.test(id)) && filter(id)) {
          return svelteCompile(`<img src="${app.dirs.root.relative(id)}" />`)
            .js;
        }

        if (MP3_RE.test(id) && filter(id)) {
          return svelteCompile(
            `<audio controls src="${app.dirs.root.relative(id)}" />`,
          ).js;
        }

        if (MP4_RE.test(id) && filter(id)) {
          return svelteCompile(
            `<video controls src="${app.dirs.root.relative(id)}" />`,
          ).js;
        }

        return null;
      },
    },
    {
      name: '@vitebook/client:svelte-ssr-context',
      enforce: 'post',
      transform(code, id, { ssr } = {}) {
        if (
          ssr &&
          !id.includes('@vitebook/client') && // Can't self-import.
          !id.includes('packages/client/dist/client') && // Linked package.
          id.endsWith('.svelte')
        ) {
          const mcs = new MagicString(code);
          const matchRE = /export\sdefault\s(.*?);/;
          const match = code.match(matchRE);
          const componentName = match?.[1];

          if (!match || !componentName) return null;

          const start = code.search(match[0]);
          const end = start + match[0].length;

          const addModuleCode = `  __vitebook__useSSRContext().modules.add(${JSON.stringify(
            app.dirs.root.relative(id),
          )})`;

          mcs.overwrite(
            start,
            end,
            [
              "import { useSSRContext as __vitebook__useSSRContext } from '@vitebook/client';",
              `const $$render = ${componentName}.$$render;`,
              `${componentName}.$$render = function(...args) {`,
              addModuleCode,
              '  return $$render(...args)',
              '}',
              '',
              match[0],
            ].join('\n'),
          );

          return {
            code: mcs.toString(),
            map: mcs.generateMap({ source: id }).toString(),
          };
        }

        return null;
      },
    },
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
  scopeClass = DEFAULT_THEME_SCOPE_CLASS,
}: AddThemeScopeOptions) {
  const mcs = new MagicString(content);
  const ast = parse(content, { filename });

  walk(ast, {
    enter(node) {
      if (node.type === 'Element') {
        const classAttr = node.attributes.find(
          (attr) =>
            attr.type === 'Attribute' &&
            attr.name === 'class' &&
            !attr.type.raw?.includes(scopeClass),
        );

        if (classAttr) {
          const hasMustacheTag = classAttr.value.find(
            (v) => v.type === 'MustacheTag',
          );

          if (hasMustacheTag) {
            mcs.overwrite(
              node.start,
              node.start + node.name.length + 1,
              `<${node.name} class:${scopeClass}={true} `,
            );
          } else {
            mcs.prependLeft(classAttr.end - 1, ` ${scopeClass}`);
          }
        } else {
          mcs.overwrite(
            node.start,
            node.start + node.name.length + 1,
            `<${node.name} class="${scopeClass}"`,
          );
        }
      }
    },
  });

  return {
    code: mcs.toString(),
    map: mcs.generateMap({ source: filename }).toString(),
  };
}

function themeScope({
  scopeClass,
  include = DEFAULT_THEME_SCOPE_INCLUDE,
  exclude,
}: ThemeScopeOptions = {}): PreprocessorGroup {
  const filter = createFilter(include, exclude);

  return {
    // @ts-expect-error - can return `undefined`.
    async markup({ content, filename }) {
      if (filter(filename)) {
        return addThemeScope({
          filename,
          content,
          scopeClass,
        });
      }
    },
  };
}

function staticifyMarkdown(): PreprocessorGroup {
  const filter = createFilter(/\.md$/);

  return {
    // @ts-expect-error - can return `undefined`.
    async markup({ content, filename }) {
      if (filter(filename)) {
        const mcs = new MagicString(content);
        const ast = parse(content, { filename });

        const staticNodeTypeRE = /(Element|Fragment|Text)/;
        const staticBlocks: (readonly [number, number])[] = [];

        const findStaticBlock = (node) => {
          if (!node.children) {
            return [node.start as number, node.end as number] as const;
          }

          const queue = [node];
          const seen = new Set();

          while (queue.length > 0) {
            const currentNode = queue[0];

            const hasDynamicAttribute = (node.attributes ?? []).some(
              (attr) =>
                attr.value?.[0]?.expression || attr.type !== 'Attribute',
            );

            if (
              !staticNodeTypeRE.test(currentNode.type) ||
              hasDynamicAttribute
            ) {
              return null;
            }

            if (node.children) {
              for (const child of node.children) {
                if (!seen.has(child)) {
                  queue.push(child);
                  seen.add(child);
                }
              }
            }

            queue.shift();
          }

          return [node.start as number, node.end as number] as const;
        };

        walk(ast.html, {
          enter(node) {
            if (node.type === 'Element' || node.type === 'Fragment') {
              const staticBlock = findStaticBlock(node);
              if (staticBlock) {
                staticBlocks.push(staticBlock);
                this.skip();
              }
            }
          },
        });

        staticBlocks.forEach(([start, end]) => {
          if (end > start) {
            mcs.overwrite(start, end, `{@html \`${mcs.slice(start, end)}\`}`);
          }
        });

        return {
          code: mcs.toString(),
          map: mcs.generateMap({ source: filename }).toString(),
        };
      }
    },
  };
}

export function combineSourcemaps(
  filename: string,
  sourcemapList: Array<DecodedSourceMap | RawSourceMap>,
): RawSourceMap | undefined {
  if (sourcemapList.length == 0) return undefined;

  let map_idx = 1;

  // @ts-expect-error - .
  const map: RawSourceMap =
    sourcemapList.slice(0, -1).find((m) => m.sources.length !== 1) === undefined
      ? remapping(
          // use array interface
          // only the oldest sourcemap can have multiple sources
          sourcemapList,
          () => null,
          true, // skip optional field `sourcesContent`
        )
      : remapping(
          // use loader interface
          sourcemapList[0], // last map
          function loader(sourcefile) {
            if (sourcefile === filename && sourcemapList[map_idx]) {
              return sourcemapList[map_idx++]; // idx 1, 2, ...
              // bundle file = branch node
            } else {
              return null; // source file = leaf node
            }
          } as SourceMapLoader,
          true,
        );

  if (!map.file) delete map.file; // skip optional field `file`

  // When source maps are combined and the leading map is empty, sources is not set.
  // Add the filename to the empty array in this case.
  // Further improvements to remapping may help address this as well https://github.com/ampproject/remapping/issues/116
  if (!map.sources.length) map.sources = [filename];

  return map;
}
