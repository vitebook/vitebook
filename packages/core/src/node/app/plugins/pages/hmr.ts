import fs from 'fs';
import { normalizePath, type ViteDevServer } from 'vite';

import { virtualModuleRequestPath } from '../../alias';
import type { App } from '../../App';
import { clearServerLoaderCache } from '../core/serverLoader';

export type PagesHMRConfig = {
  app: App;
  server: ViteDevServer;
};

export function handleHMR({ app, server }: PagesHMRConfig) {
  const pages = app.pages;

  const isPage = (filePath) => pages.isPage(filePath);
  const isLayout = (filePath) => pages.isLayout(filePath);

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
    invalidateModule(virtualModuleRequestPath.pages);
    invalidateModule(virtualModuleRequestPath.layouts);
    server.ws.send({ type: 'full-reload' });
  }

  function invalidateModule(id: string) {
    const mod = server.moduleGraph.getModuleById(id);
    if (mod) server.moduleGraph.invalidateModule(mod);
  }
}
