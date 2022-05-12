import { normalizePath, type ViteDevServer } from 'vite';

import { virtualModuleRequestPath } from '../../alias';
import { type Pages } from './Pages';

export type PagesHMRConfig = {
  pages: Pages;
  server: ViteDevServer;
};

export function handleHMR({ pages, server }: PagesHMRConfig) {
  const isPage = (filePath) => pages.isPage(filePath);
  const isLayout = (filePath) => pages.isLayout(filePath);

  onFileEvent(isPage, 'add', async (filePath) => {
    pages.addPage(filePath);
    invalidateModule(virtualModuleRequestPath.pages);
  });

  onFileEvent(isPage, 'unlink', async (filePath) => {
    pages.removePage(filePath);
    return { reload: true };
  });

  onFileEvent(isPage, 'change', async (filePath) => {
    const page = pages.getPage(filePath);
    const layoutName = pages.getPageLayoutName(filePath);

    if (page && page?.layoutName !== layoutName) {
      page.layouts = pages.resolveLayouts(filePath);
      return { reload: true };
    }

    return null;
  });

  onFileEvent(isLayout, 'add', async (filePath) => {
    pages.addLayout(filePath);
    return { reload: true };
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
