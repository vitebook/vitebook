import fs from 'fs/promises';
import type { App } from 'node/app/App';
import { normalizePath } from 'node/utils';
import type { ServerPageFile } from 'server/types';
import type { ViteDevServer } from 'vite';

import { clearMarkdownCache } from '../../markdoc';
import { virtualModuleRequestPath } from '../alias';
import { clearStaticLoaderCache } from '../core/static-loader';

export function handleFilesHMR(app: App) {
  const pages = app.files.pages;
  const layouts = app.files.layouts;
  const endpoints = app.files.endpoints;
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
    const hasStaticLoader = pages.hasStaticLoader(fileContent);
    const hasServerLoader = pages.hasServerLoader(fileContent);
    const hasServerAction = pages.hasServerAction(fileContent);

    let reload = false;

    if (!page) {
      pages.remove(filePath);
      return { reload: true };
    }

    if (page.layoutName !== layoutName) {
      page.layouts = layouts.getOwnedLayoutIndicies(
        page.filePath,
        page.layoutName,
      );
      reload = true;
    }

    if (
      page.hasStaticLoader !== hasStaticLoader ||
      page.hasServerLoader !== hasServerLoader ||
      page.hasServerAction !== hasServerAction
    ) {
      page.hasStaticLoader = hasStaticLoader;
      page.hasServerLoader = hasServerLoader;
      page.hasServerAction = hasServerAction;
      clearStaticLoaderCache(filePath);
      reload = true;
    }

    return reload ? { reload: true } : null;
  });

  onFileEvent(isLayout, 'add', async (filePath) => {
    layouts.add(filePath);
    clearLayoutChildrenMarkdownCache(filePath);
    return { reload: true };
  });

  onFileEvent(isLayout, 'change', async (filePath) => {
    const layout = layouts.find(filePath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const hasStaticLoader = pages.hasStaticLoader(fileContent);
    const hasServerLoader = pages.hasServerLoader(fileContent);
    const hasServerAction = pages.hasServerAction(fileContent);

    let reload = false;

    if (!layout) {
      layouts.remove(filePath);
      return { reload: true };
    }

    if (
      layout.hasStaticLoader !== hasStaticLoader ||
      layout.hasServerLoader !== hasServerLoader ||
      layout.hasServerAction !== hasServerAction
    ) {
      layout.hasStaticLoader = hasStaticLoader;
      layout.hasServerLoader = hasServerLoader;
      layout.hasServerAction = hasServerAction;
      clearStaticLoaderCache(filePath);
      reload = true;
    }

    return reload ? { reload: true } : null;
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

export function invalidatePageModule(
  server: ViteDevServer,
  page: ServerPageFile,
) {
  const module = server.moduleGraph
    .getModulesByFile(page.filePath)
    ?.values()
    .next();

  if (module?.value) server.moduleGraph.invalidateModule(module.value);
}
