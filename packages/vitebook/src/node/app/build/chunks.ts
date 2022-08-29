import type { GetManualChunk } from 'rollup';
import { type ManifestChunk as ViteManifestChunk } from 'vite';

import type { ServerPage } from '../../../shared';
import type { App } from '../App';
import type { BuildBundles } from './build';

export function extendManualChunks(): GetManualChunk {
  return (id) => {
    if (id.includes('vite/')) return 'vite';

    if (id.includes('node_modules')) {
      if (/\/svelte\//.test(id)) return 'svelte';
      if (/@vitebook/.test(id)) return 'vitebook';
    }

    return null;
  };
}

export function resolvePageChunks(
  app: App,
  page: ServerPage,
  { entryChunk, appChunk, viteManifest }: BuildBundles['client'],
  modules?: Set<string>,
) {
  const imports = new Set<string>();
  const dynamicImports = new Set<string>();
  const assets = new Set<string>();

  const seen = new WeakSet<ViteManifestChunk>();
  const collectChunks = (chunk?: ViteManifestChunk, isPage = false) => {
    if (
      !chunk ||
      seen.has(chunk) ||
      (!isPage && chunk.file.includes('@page'))
    ) {
      return;
    }

    if (chunk.assets) {
      for (const id of chunk.assets) {
        const asset = viteManifest[id];
        if (asset) assets.add(asset.file);
      }
    }

    if (chunk.imports) {
      for (const id of chunk.imports) {
        const chunk = viteManifest[id];
        if (chunk) {
          collectChunks(chunk);
          imports.add(chunk.file);
        }
      }
    }

    if (chunk.dynamicImports) {
      for (const id of chunk.dynamicImports) {
        const chunk = viteManifest[id];
        if (
          chunk &&
          !imports.has(chunk.file) &&
          !chunk.file.includes('@page') &&
          !chunk.file.includes('@layout')
        ) {
          dynamicImports.add(chunk.file);
        }
      }
    }

    seen.add(chunk);
  };

  // Entry

  const entryId = app.dirs.root.relative(entryChunk.facadeModuleId!);
  collectChunks(viteManifest[entryId]);
  imports.add(entryChunk.fileName);

  // App

  const appId = app.dirs.root.relative(appChunk.facadeModuleId!);
  collectChunks(viteManifest[appId]);
  imports.add(appChunk.fileName);

  // Layouts

  const layoutChunks = page.layouts.map((index) =>
    app.nodes.layouts.getByIndex(index),
  );

  for (const layout of layoutChunks) {
    const chunk = viteManifest[layout.rootPath];
    if (chunk) {
      collectChunks(chunk);
      imports.add(chunk.file);
    }
  }

  // Modules

  if (modules) {
    for (const id of modules) {
      const chunk = viteManifest[id];
      if (chunk) {
        collectChunks(viteManifest[id]);
        imports.add(chunk.file);
      }
    }
  }

  // Page

  const pageChunk = viteManifest[page.rootPath];

  if (pageChunk) {
    collectChunks(pageChunk, true);
    imports.add(pageChunk.file);
  }

  return {
    assets: Array.from(assets),
    imports: Array.from(imports),
    dynamicImports: Array.from(dynamicImports),
  };
}
