import type { App } from 'node/app/App';
import type { PageFileRoute } from 'node/app/routes';
import type { GetManualChunk } from 'rollup';
import type { ManifestChunk as ViteManifestChunk } from 'vite';

import type { BuildBundles, BuildData } from './build';

export function extendManualChunks(): GetManualChunk {
  return (id) => {
    if (id.includes('vite/')) return 'vite';

    if (id.includes('node_modules')) {
      if (/\/@?svelte\//.test(id)) return 'svelte';
      if (/\/@?vue\//.test(id)) return 'vue';
      if (/\/@?react\//.test(id)) return 'react';
      if (/\/@?solid\//.test(id)) return 'solid';
      if (/\/@?maverick\//.test(id)) return 'maverick';
      if (/\/@?vitebook/.test(id)) return 'vitebook';
    }

    return null;
  };
}

export function resolveServerLoaderChunks(
  app: App,
  { chunks }: BuildBundles['server'],
) {
  const serverRoutes: BuildData['serverRoutes'] = new Set();

  for (let i = 0; i < app.routes.client.length; i++) {
    const route = app.routes.client[i];

    const chunk = chunks.find(
      (chunk) => chunk.facadeModuleId === route.file.path,
    );

    if (chunk?.exports.includes('serverLoader')) serverRoutes.add(route);
  }

  return serverRoutes;
}

export function resolvePageChunks(
  app: App,
  route: PageFileRoute,
  { entryChunk, appChunk, viteManifest }: BuildBundles['client'],
) {
  const imports = new Set<string>();
  const dynamicImports = new Set<string>();
  const assets = new Set<string>();

  const pageSrc = new Set(
    app.files.pages.toArray().map((page) => page.rootPath),
  );

  const layoutSrc = new Set(
    app.files.layouts.toArray().map((layout) => layout.rootPath),
  );

  const seen = new WeakSet<ViteManifestChunk>();
  const collectChunks = (chunk?: ViteManifestChunk, page = false) => {
    if (!chunk || seen.has(chunk) || (!page && pageSrc.has(chunk.src!))) {
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
          !pageSrc.has(chunk.src!) &&
          !layoutSrc.has(chunk.src!)
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

  for (const layout of route.file.layouts) {
    const chunk = viteManifest[layout.rootPath];
    if (chunk) {
      collectChunks(chunk);
      imports.add(chunk.file);
    }
  }

  // Page

  const pageChunk = viteManifest[route.file.rootPath];

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
