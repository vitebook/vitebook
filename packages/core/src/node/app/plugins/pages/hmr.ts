import fs from 'fs';
import { ServerPage } from 'src/shared';
import { type ViteDevServer } from 'vite';

import { normalizePath } from '../../../utils';
import { virtualModuleRequestPath } from '../../alias';
import type { App } from '../../App';
import { clearServerLoaderCache } from '../core/server-loader';
import { clearMarkdownCache } from '../markdown';

export type PagesHMRConfig = {
  app: App;
  server: ViteDevServer;
};

export function handleHMR({ app, server }: PagesHMRConfig) {
  const pages = app.pages;

  const isPage = (filePath) => pages.isPage(filePath);
  const isLayout = (filePath) => pages.isLayout(filePath);

  function clearLayoutChildrenMarkdownCaches(layoutFilePath: string) {
    const layoutIndex = app.pages.getLayoutIndex(layoutFilePath);
    for (const page of app.pages.all) {
      if (page.layouts.includes(layoutIndex)) {
        clearMarkdownCache(page.filePath);
        invalidatePageModule(server, page);
      }
    }
  }

  onFileEvent(isPage, 'add', async (filePath) => {
    pages.addPage(filePath);
    return { reload: true };
  });

  onFileEvent(isPage, 'unlink', async (filePath) => {
    pages.removePage(filePath);
    return { reload: true };
  });

  onFileEvent(isPage, 'change', async (filePath) => {
    const page = pages.getPage(filePath);
    const layoutName = pages.getPageLayoutName(filePath);
    const hasLoader = pages.hasLoader(
      fs.readFileSync(filePath, { encoding: 'utf-8' }),
    );

    if (page && page?.layoutName !== layoutName) {
      page.layouts = pages.resolveLayouts(filePath);
      return { reload: true };
    }

    if (page && page.hasLoader !== hasLoader) {
      page.hasLoader = hasLoader;
      return { reload: true };
    }

    if (hasLoader) {
      clearServerLoaderCache(filePath);
    }

    return null;
  });

  onFileEvent(isLayout, 'add', async (filePath) => {
    pages.addLayout(filePath);
    clearLayoutChildrenMarkdownCaches(filePath);
    return { reload: true };
  });

  onFileEvent(isLayout, 'change', async (filePath) => {
    const layout = pages.getLayout(filePath);
    const hasLoader = pages.hasLoader(
      fs.readFileSync(filePath, { encoding: 'utf-8' }),
    );

    if (layout && layout.hasLoader !== hasLoader) {
      layout.hasLoader = hasLoader;
      return { reload: true };
    }

    if (hasLoader) {
      clearServerLoaderCache(filePath);
    }

    return null;
  });

  onFileEvent(isLayout, 'unlink', async (filePath) => {
    clearLayoutChildrenMarkdownCaches(filePath);
    pages.removeLayout(filePath);
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
