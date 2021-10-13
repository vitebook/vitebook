import type { RollupOutput } from 'rollup';
import { build, mergeConfig, Plugin, UserConfig as ViteConfig } from 'vite';

import type { App } from '../../App';

export type BundleResult = [
  clientBundle: RollupOutput,
  serverBundle: RollupOutput
];

export async function bundle(app: App): Promise<BundleResult> {
  const [client, server] = await Promise.all([
    // Build SSR manifest.
    await build(
      resolveBundleConfig(app, {
        ssr: false
      })
    ),
    // Build server entry.
    await build(
      resolveBundleConfig(app, {
        ssr: true
      })
    )
  ]);

  return [client as RollupOutput, server as RollupOutput];
}

const clientPackages = [
  '@vitebook/client',
  '@vitebook/core',
  '@vitebook/markdown',
  '@vitebook/markdown-preact',
  '@vitebook/markdown-prismjs',
  '@vitebook/markdown-shiki',
  '@vitebook/markdown-svelte',
  '@vitebook/markdown-vue',
  '@vitebook/preact',
  '@vitebook/svelte',
  '@vitebook/theme-default'
];

type BundleOptions = {
  config?: ViteConfig;
  ssr: boolean;
};

function resolveBundleConfig(
  app: App,
  { config = {}, ssr }: BundleOptions
): ViteConfig {
  const baseBundleConfig: ViteConfig = {
    logLevel: 'warn',
    publicDir: ssr ? false : undefined,
    // @ts-expect-error - not typed.
    ssr: ssr
      ? {
          noExternal: clientPackages
        }
      : undefined,
    optimizeDeps: {
      exclude: clientPackages
    },
    esbuild: { treeShaking: !ssr },
    minify: ssr ? false : !app.env.isDebug,
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
              chunkFileNames(chunk) {
                if (!chunk.isEntry && /runtime/.test(chunk.name)) {
                  return `assets/framework.[hash].js`;
                }

                if (!chunk.isEntry && /@vitebook/.test(chunk.name)) {
                  return `assets/vitebook.[hash].js`;
                }

                return 'assets/[name].[hash].js';
              }
            }
      }
    },
    plugins: [buildPlugin(app, { ssr })]
  };

  return mergeConfig(app.options.vite, mergeConfig(baseBundleConfig, config));
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
    }
  };
}
