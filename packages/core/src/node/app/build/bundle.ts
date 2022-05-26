import type { RollupOutput } from 'rollup';
import path from 'upath';
import {
  build,
  mergeConfig,
  Plugin,
  type UserConfig as ViteConfig,
} from 'vite';

import type { ServerLayout, ServerPage } from '../../../shared';
import type { App } from '../App';
import { stripPageInfoFromPath } from '../plugins/pages';
import { extendManualChunks } from './chunks';

export type BundleResult = [
  clientBundle: RollupOutput,
  serverBundle: RollupOutput,
];

export async function bundle(app: App): Promise<BundleResult> {
  const [client, server] = await Promise.all([
    // Build SSR manifest.
    await build(
      resolveBundleConfig(app, {
        ssr: false,
      }),
    ),
    // Build server entry.
    await build(
      resolveBundleConfig(app, {
        ssr: true,
      }),
    ),
  ]);

  return [client as RollupOutput, server as RollupOutput];
}

type BundleConfig = {
  config?: ViteConfig;
  ssr: boolean;
};

function resolveBundleConfig(
  app: App,
  { config = {}, ssr }: BundleConfig,
): ViteConfig {
  const input = {
    entry: ssr ? app.client.entry.server : app.client.entry.client,
    // TODO: hardcoding app entry for now until we can use alias (app.config.client.app).
    // https://github.com/rollup/plugins/issues/1190
    app: '@vitebook/svelte/App.svelte',
    ...getAppBundleEntries(app),
  };

  const baseBundleConfig: ViteConfig = {
    root: app.dirs.root.path,
    logLevel: 'warn',
    publicDir: ssr ? false : undefined,
    esbuild: { treeShaking: !ssr },
    build: {
      emptyOutDir: true,
      ssr,
      ssrManifest: !ssr,
      cssCodeSplit: false,
      assetsDir: 'assets',
      minify: ssr ? false : !app.env.isDebug,
      outDir: ssr
        ? app.dirs.root.relative(app.dirs.out.resolve('server'))
        : app.dirs.root.relative(app.dirs.out.path),
      rollupOptions: {
        preserveEntrySignatures: 'allow-extension',
        input,
        output: ssr
          ? {
              format: 'cjs',
              entryFileNames: `[name].cjs`,
              assetFileNames: `[name].cjs`,
              chunkFileNames: `[name].cjs`,
            }
          : {
              manualChunks: extendManualChunks(),
              assetFileNames(asset) {
                if (/\.css$/.test(asset.name ?? '')) {
                  return 'assets/css/[name].[hash].css';
                }

                return 'assets/[name].[hash][extname]';
              },
              chunkFileNames() {
                return 'assets/js/[name].[hash].js';
              },
            },
      },
    },
    plugins: [...app.plugins, buildPlugin(app, { ssr })],
  };

  const mergedConfig = mergeConfig(
    app.vite?.config ?? {},
    mergeConfig(baseBundleConfig, config),
  );

  if (!ssr) mergedConfig.ssr = undefined;

  return mergedConfig;
}

function buildPlugin(app: App, { ssr = false }: BundleConfig): Plugin {
  return {
    name: '@vitebook/build',
    generateBundle(_, bundle) {
      if (ssr) {
        // SSR build - delete all asset chunks.
        for (const name in bundle) {
          if (bundle[name].type === 'asset') {
            delete bundle[name];
          }
        }
      }
    },
  };
}

let savedEntries: Record<string, string>;
export function getAppBundleEntries(app: App) {
  if (savedEntries) return savedEntries;

  const entries: Record<string, string> = {};

  for (const page of app.pages.all) {
    const filename = buildPageOutputFilename(app, page);
    entries[filename] = page.filePath;
  }

  for (const layout of app.pages.layouts) {
    const filename = buildLayoutOutputFilename(app, layout);
    entries[filename] = layout.filePath;
  }

  savedEntries = entries;
  return entries;
}

function buildPageOutputFilename(app: App, page: ServerPage) {
  const name = path.trimExt(
    stripPageInfoFromPath(app.dirs.pages.relative(page.rootPath)),
  );

  return `pages/${name}`;
}

function buildLayoutOutputFilename(app: App, layout: ServerLayout) {
  const name = path
    .trimExt(app.dirs.pages.relative(layout.rootPath))
    .replace(/@layouts\//, '');

  return `layouts/${name}`;
}
