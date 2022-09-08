import type { App } from 'node/app/App';
import { createAppEntries } from 'node/app/create/app-factory';
import { OutputBundle } from 'rollup';
import { build, type UserConfig as ViteConfig } from 'vite';

import { extendManualChunks } from './chunks';

export async function createServerBundle(
  callback: (bundle: OutputBundle) => void,
) {
  // Vite will load `vite.config.*` which also includes Vitebook plugin and configuration.
  await build({
    build: { ssr: true },
    plugins: [
      {
        name: 'vitebook-server-bundle',
        writeBundle(_, bundle) {
          callback(bundle);
        },
      },
    ],
  });
}

export function resolveBuildConfig(app: App): ViteConfig {
  const ssr = app.config.isSSR;
  const immutableDir = '_immutable';

  const input = {
    entry: ssr ? app.config.entry.server : app.config.entry.client,
    app: app.config.client.app,
    ...createAppEntries(app),
  };

  return {
    appType: 'spa',
    logLevel: 'warn',
    publicDir: ssr ? false : app.dirs.public.path,
    esbuild: { treeShaking: !ssr },
    build: {
      emptyOutDir: true,
      ssr,
      target: ssr ? 'node16' : undefined,
      manifest: !ssr && `vite-manifest.json`,
      ssrManifest: false,
      cssCodeSplit: false,
      assetsDir: `${immutableDir}/assets`,
      minify: !ssr && !app.config.debug,
      polyfillModulePreload: true,
      outDir: ssr
        ? app.dirs.root.relative(app.dirs.server.path)
        : app.dirs.root.relative(app.dirs.client.path),
      rollupOptions: {
        input,
        output: {
          format: 'esm',
          entryFileNames: ssr
            ? `[name].js`
            : `${immutableDir}/[name]-[hash].js`,
          chunkFileNames: ssr
            ? 'chunks/[name].js'
            : `${immutableDir}/chunks/[name]-[hash].js`,
          assetFileNames: ssr
            ? ''
            : `${immutableDir}/assets/[name]-[hash][extname]`,
          manualChunks: extendManualChunks(),
        },
        preserveEntrySignatures: 'allow-extension',
      },
    },
  };
}
