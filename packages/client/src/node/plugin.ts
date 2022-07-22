import { createFilter, FilterPattern } from '@rollup/pluginutils';
import {
  App,
  ClientPlugin,
  isArray,
  Plugin,
  VM_PREFIX,
} from '@vitebook/core/node';
import { fs, logger, path } from '@vitebook/core/node/utils';
import { transform } from 'esbuild';
import kleur from 'kleur';
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
   * Applies a CSS class to all elements in included `.svelte` files to enable scoped styling. This
   * is to avoid theme styles affecting user components in pages/stories.
   */
  themeScope?: ThemeScopeOptions;
};

const VIRTUAL_APP_ID = `${VM_PREFIX}/client/app`;
const VIRTUAL_APP_REQUEST_PATH = '/' + VIRTUAL_APP_ID;

const DEFAULT_INCLUDE_RE = /\.svelte($|\?)/;
const DEFAULT_THEME_SCOPE_CLASS = '__vbk__';

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

  return [
    {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      name: PLUGIN_NAME,
      enforce: 'pre',
      entry: {
        client: require.resolve(`${PLUGIN_NAME}/entry-client.js`),
        server: require.resolve(`${PLUGIN_NAME}/entry-server.js`),
      },
      api: {
        sveltePreprocess: typescriptPreprocessor(),
      },
      async configureApp(_app) {
        app = _app;

        themeScopeFilter = createFilter(
          [
            /@vitebook\/.+\.svelte/,
            /vitebook\/packages\/.+\.svelte/,
            new RegExp(app.dirs.theme.path + '.+\\.svelte'),
            ...(isArray(options.themeScope?.include)
              ? options.themeScope!.include
              : [options.themeScope?.include].filter(Boolean)),
          ],
          options.themeScope?.exclude,
        );

        app.context.themeScopeClass =
          options.themeScope?.scopeClass ?? DEFAULT_THEME_SCOPE_CLASS;

        try {
          const hasSveltePlugin = app.hasPlugin('vite-plugin-svelte');
          const hasMarkdownSveltePlugin = app.hasPlugin(
            '@vitebook/markdown-svelte',
          );

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (!hasSveltePlugin) {
            let sveltePlugin;

            try {
              const { svelte } = await import('@sveltejs/vite-plugin-svelte');
              sveltePlugin = svelte;
            } catch (e) {
              //
            }

            // Might be monorepo
            if (!sveltePlugin) {
              const rootPath = app.dirs.root.resolve(
                'node_modules/@sveltejs/vite-plugin-svelte',
              );

              const modulePath = JSON.parse(
                (await fs.readFile(`${rootPath}/package.json`)).toString(),
              ).module;

              const { svelte } = await import(
                path.resolve(rootPath, modulePath)
              );

              sveltePlugin = svelte;
            }

            if (!sveltePlugin) {
              throw Error('`@sveltejs/vite-plugin-svelte` was not found');
            }

            _app.plugins.push(
              sveltePlugin({
                compilerOptions: { hydratable: true },
                extensions: hasMarkdownSveltePlugin
                  ? ['.svelte', '.md']
                  : ['.svelte'],
              }),
            );
          }
        } catch (e) {
          throw logger.createError(
            `${kleur.bold('@vitebook/client')} requires ${kleur.bold(
              '@sveltejs/vite-plugin-svelte',
            )}\n\n${kleur.white(
              `See ${kleur.bold(
                'https://github.com/sveltejs/vite-plugin-svelte',
              )} for more information`,
            )}\n`,
          );
        }
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
        if (themeScopeFilter(id) && !id.includes('&type=')) {
          return addThemeScope({
            content: code,
            filename: id,
            scopeClass:
              options.themeScope?.scopeClass ?? DEFAULT_THEME_SCOPE_CLASS,
          });
        }

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
   * @default [/@vitebook/]
   */
  include?: FilterPattern;
  /**
   * Svelte files to be excluded from theme scoping.
   *
   * @default undefined
   */
  exclude?: FilterPattern;
};

function addThemeScope({
  content,
  filename,
  scopeClass,
}: {
  content: string;
  filename: string;
  scopeClass: string;
}) {
  const mcs = new MagicString(content);
  const ast = parse(content, { filename });

  walk(ast, {
    enter(node) {
      if (/(script|style)/.test(node.name)) {
        this.skip();
        return;
      }

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

/**
 * @returns {import('svelte/types/compiler/preprocess').PreprocessorGroup}
 */
function typescriptPreprocessor() {
  const typescriptRE = /^(ts|typescript)($||\/)/;

  return {
    async script({ filename, attributes, content }) {
      const isTypescript =
        typeof attributes.lang === 'string' &&
        typescriptRE.test(attributes.lang);

      if (isTypescript) {
        return transform(content, {
          sourcefile: filename,
          charset: 'utf8',
          loader: 'ts',
          format: 'esm',
          minify: false,
          target: 'esnext',
          tsconfigRaw: {
            compilerOptions: {
              importsNotUsedAsValues: 'preserve',
              // @ts-expect-error - .
              preserveValueImports: true,
            },
          },
        });
      }

      return null;
    },
  };
}
