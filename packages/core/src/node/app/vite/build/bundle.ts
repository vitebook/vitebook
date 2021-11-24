import type { RollupOutput } from 'rollup';
import { build, mergeConfig, Plugin, UserConfig as ViteConfig } from 'vite';

import type { App } from '../../App';

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
  const baseBundleConfig: ViteConfig = {
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
        input: ssr ? app.client.entry.server : app.client.entry.client,
        output: ssr
          ? undefined
          : {
              manualChunks: {
                framework: ['svelte'],
              },
              assetFileNames(asset) {
                if (/\.css$/.test(asset.name ?? '')) {
                  return 'assets/css/[name].[hash].css';
                }

                return 'assets/[name].[hash][extname]';
              },
              chunkFileNames(chunk) {
                if (
                  !chunk.isEntry &&
                  (/runtime/.test(chunk.name) ||
                    chunk.name.startsWith('preact'))
                ) {
                  return `assets/js/framework.[hash].js`;
                }

                const isVitebookChunk = /@vitebook/.test(
                  chunk.facadeModuleId ?? '',
                );

                if (
                  !chunk.isEntry &&
                  /\.svg(\?raw)?/.test(chunk.facadeModuleId ?? '')
                ) {
                  return `assets/js${
                    isVitebookChunk ? '/@vitebook' : ''
                  }/svg/[name].[hash].js`;
                }

                if (!chunk.isEntry && isVitebookChunk) {
                  return `assets/js/@vitebook/[name].[hash].js`;
                }

                return 'assets/js/[name].[hash].js';
              },
            },
      },
    },
    plugins: [buildPlugin(app, { ssr })],
  };

  const mergedConfig = mergeConfig(
    app.options.vite,
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
