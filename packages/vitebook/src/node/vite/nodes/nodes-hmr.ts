import fs from 'fs/promises';
import type { App } from 'node/app/App';
import { normalizePath } from 'node/utils';
import type { ServerPage } from 'server/types';
import type { ViteDevServer } from 'vite';

import { clearMarkdownCache } from '../../markdoc';
import { virtualModuleRequestPath } from '../alias';
import { clearStaticLoaderCache } from '../core/static-loader';

export function handleNodesHMR(app: App) {
  const pages = app.nodes.pages;
  const layouts = app.nodes.layouts;
  const endpoints = app.nodes.endpoints;
  const server = app.vite.server!;

  const isPage = (filePath) => pages.is(filePath);
  const isLayout = (filePath) => layouts.is(filePath);
  const isEndpoint = (filePath) => endpoints.is(filePath);

  function clearLayoutChildrenMarkdownCache(layoutFilePath: string) {
    const layoutIndex = layouts.findIndex(layoutFilePath);
    for (const page of pages) {
      if (page.layouts.includes(layoutIndex)) {
        clearMarkdownCache(page.filePath);
        invalidatePageModule(server, page);
      }
    }
  }

  onFileEvent(isEndpoint, 'add', async (filePath) => {
    endpoints.add(filePath);
  });

  onFileEvent(isEndpoint, 'unlink', async (filePath) => {
    endpoints.remove(filePath);
  });

  onFileEvent(isPage, 'add', async (filePath) => {
    pages.add(filePath);
    return { reload: true };
  });

  onFileEvent(isPage, 'unlink', async (filePath) => {
    pages.remove(filePath);
    return { reload: true };
  });

  onFileEvent(isPage, 'change', async (filePath) => {
    const page = pages.find(filePath);
    const layoutName = await pages.getLayoutName(filePath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const hasAnyLoader =
      pages.hasStaticLoader(fileContent) || pages.hasServerLoader(fileContent);

    if (page && page.layoutName !== layoutName) {
      page.layouts = layouts.getOwnedLayoutIndicies(
        page.filePath,
        page.layoutName,
      );
      return { reload: true };
    }

    if (page && page.hasAnyLoader !== hasAnyLoader) {
      page.hasStaticLoader = hasAnyLoader;
      return { reload: true };
    }

    if (hasAnyLoader) {
      clearStaticLoaderCache(filePath);
    }

    return null;
  });

  onFileEvent(isLayout, 'add', async (filePath) => {
    layouts.add(filePath);
    clearLayoutChildrenMarkdownCache(filePath);
    return { reload: true };
  });

  onFileEvent(isLayout, 'change', async (filePath) => {
    const layout = layouts.find(filePath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const hasAnyLoader =
      layouts.hasStaticLoader(fileContent) ||
      layouts.hasServerLoader(fileContent);

    if (layout && layout.hasAnyLoader !== hasAnyLoader) {
      layout.hasStaticLoader = hasAnyLoader;
      return { reload: true };
    }

    if (hasAnyLoader) {
      clearStaticLoaderCache(filePath);
    }

    return null;
  });

  onFileEvent(isLayout, 'unlink', async (filePath) => {
    clearLayoutChildrenMarkdownCache(filePath);
    layouts.remove(filePath);
    return { reload: true };
  });

  function onFileEvent(
    test: (path: string) => boolean,
    eventName: string,
    handler: (path: string) => Promise<void | null | { reload?: boolean }>,
  ) {
    server.watcher.on(eventName, async (path) => {
      const filePath = normalizePath(path);

      if (!test(filePath)) return;

      const { reload } = (await handler(filePath)) ?? {};

      if (reload) {
        fullReload();
      }
    });
  }

  function fullReload() {
    invalidateModuleByID(virtualModuleRequestPath.pages);
    invalidateModuleByID(virtualModuleRequestPath.layouts);
    server.ws.send({ type: 'full-reload' });
  }

  function invalidateModuleByID(id: string) {
    const mod = server.moduleGraph.getModuleById(id);
    if (mod) server.moduleGraph.invalidateModule(mod);
  }
}

export function invalidatePageModule(server: ViteDevServer, page: ServerPage) {
  const module = server.moduleGraph
    .getModulesByFile(page.filePath)
    ?.values()
    .next();

  if (module?.value) server.moduleGraph.invalidateModule(module.value);
}
