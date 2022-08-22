import fs from 'fs';
import { type ViteDevServer } from 'vite';

import { type ServerPage } from '../../../../shared';
import { normalizePath } from '../../../utils';
import { virtualModuleRequestPath } from '../../alias';
import { type App } from '../../App';
import { clearServerLoaderCache } from '../core/server-loader';
import { clearMarkdownCache } from '../markdown';

export function handlePagesHMR(app: App) {
  const routes = app.routes;
  const server = app.vite.server!;
  const isPage = (filePath) => routes.isPage(filePath);
  const isLayout = (filePath) => routes.isLayout(filePath);

  function clearLayoutChildrenMarkdownCaches(layoutFilePath: string) {
    const layoutIndex = routes.getLayoutIndex(layoutFilePath);
    for (const page of routes.pages) {
      if (page.layouts.includes(layoutIndex)) {
        clearMarkdownCache(page.filePath);
        invalidatePageModule(server, page);
      }
    }
  }

  onFileEvent(isPage, 'add', async (filePath) => {
    routes.addPage(filePath);
    return { reload: true };
  });

  onFileEvent(isPage, 'unlink', async (filePath) => {
    routes.removePage(filePath);
    return { reload: true };
  });

  onFileEvent(isPage, 'change', async (filePath) => {
    const page = routes.getPage(filePath);
    const layoutName = routes.getPageLayoutName(filePath);
    const hasLoader = routes.hasLoader(
      fs.readFileSync(filePath, { encoding: 'utf-8' }),
    );

    if (page && page?.layoutName !== layoutName) {
      page.layouts = routes.resolvePageLayouts(filePath);
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
    routes.addLayout(filePath);
    clearLayoutChildrenMarkdownCaches(filePath);
    return { reload: true };
  });

  onFileEvent(isLayout, 'change', async (filePath) => {
    const layout = routes.getLayout(filePath);
    const hasLoader = routes.hasLoader(
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
    routes.removeLayout(filePath);
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
