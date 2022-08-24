import type { GetManualChunk, OutputChunk } from 'rollup';

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

export function resolvePageImports(
  app: App,
  page: ServerPage,
  { entryChunk, appChunk, chunks }: BuildBundles['client'],
) {
  const pageChunk = chunks.find(
    (chunk) => chunk.facadeModuleId === page.filePath,
  )!;

  const layoutChunks = resolvePageLayoutChunks(app, page, chunks);

  return {
    imports: Array.from(
      new Set([
        ...entryChunk.imports.filter((i) => i !== appChunk.fileName),
        ...appChunk.imports,
        ...layoutChunks.map((chunk) => chunk.imports).flat(),
        appChunk.fileName,
        ...layoutChunks.map((chunk) => chunk.fileName),
        ...(pageChunk?.imports ?? []),
        pageChunk.fileName,
      ]),
    ),
    dynamicImports: Array.from(
      new Set([
        ...[entryChunk, appChunk]
          .map((chunk) =>
            chunk.dynamicImports.filter(
              (fileName) => !isPageChunk(fileName, chunks),
            ),
          )
          .flat(),
        ...layoutChunks.map((chunk) => chunk.dynamicImports).flat(),
        ...(pageChunk?.dynamicImports ?? []),
      ]),
    ),
  };
}

export function resolveChunkByFilePath(
  filePath: string,
  chunks: OutputChunk[],
) {
  return chunks.find((chunk) => chunk.facadeModuleId === filePath);
}

export function resolvePageLayoutChunks(
  app: App,
  page: ServerPage,
  chunks: OutputChunk[],
) {
  return page.layouts
    .map((index) => app.nodes.layouts.getByIndex(index))
    .map((layout) => resolveChunkByFilePath(layout!.filePath, chunks))
    .filter(Boolean) as OutputChunk[];
}

export function isPageChunk(fileName: string, chunks: OutputChunk[]) {
  return chunks.some((chunk) => chunk.isEntry && chunk.fileName === fileName);
}
