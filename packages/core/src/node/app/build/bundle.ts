import { build, type UserConfig as ViteConfig } from 'vite';

import type { App } from '../App';
import { extendManualChunks } from './chunks';

export async function createServerBundle() {
  // Vite will load `vite.config.*` which also includes Vitebook plugin and configuration.
  await build({ build: { ssr: true } });
}

export function resolveBuildConfig(app: App): ViteConfig {
  const ssr = app.config.isSSR;

  const input = {
    entry: ssr ? app.entry.server : app.entry.client,
    app: app.config.client.app,
    ...app.entries(),
  };

  return {
    appType: 'spa',
    publicDir: ssr ? false : undefined,
    esbuild: { treeShaking: !ssr },
    build: {
      emptyOutDir: true,
      ssr,
      target: ssr ? 'node16' : undefined,
      ssrManifest: !ssr,
      cssCodeSplit: false,
      assetsDir: 'assets',
      minify: ssr ? false : !app.config.isDebug,
      polyfillModulePreload: false,
      outDir: ssr
        ? app.dirs.root.relative(app.dirs.out.resolve('server'))
        : app.dirs.root.relative(app.dirs.out.path),
      rollupOptions: {
        input,
        output: {
          format: 'esm',
          entryFileNames: ssr ? '[name].js' : `[name]-[hash].js`,
          chunkFileNames: ssr ? 'chunks/[name].js' : `chunks/[name]-[hash].js`,
          manualChunks: extendManualChunks(),
        },
        preserveEntrySignatures: 'strict',
      },
    },
  };
}
