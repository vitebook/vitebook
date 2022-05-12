import type { RollupOutput } from 'rollup';
import path from 'upath';
import { build, mergeConfig, Plugin, UserConfig as ViteConfig } from 'vite';

import type { App } from '../App';
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

type BundleOptions = {
  config?: ViteConfig;
  ssr: boolean;
};

function resolveBundleConfig(
  app: App,
  { config = {}, ssr }: BundleOptions,
): ViteConfig {
  const input = {
    entry: ssr ? app.client.entry.server : app.client.entry.client,
  };

  if (!ssr) {
    for (const page of app.pages.getPages()) {
      const name = path.trimExt(app.dirs.pages.relative(page.rootPath));
      input[`pages/${name}`] = page.filePath;
    }

    for (const layout of app.pages.getLayouts()) {
      const name = path
        .trimExt(app.dirs.pages.relative(layout.rootPath))
        .replace(/@vbk\//, '');

      input[`layouts/${name}`] = layout.filePath;
    }
  }

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

function buildPlugin(app: App, { ssr = false }: BundleOptions): Plugin {
  return {
    name: '@vitebook/core:build',
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
