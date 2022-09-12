import type { App } from 'node/app/App';
import type { PageFile } from 'node/app/files';
import { normalizePath } from 'node/utils';
import type { ViteDevServer } from 'vite';

import { clearMarkdownCache } from '../../markdoc';
import { virtualModuleRequestPath } from '../alias';

export function handleFilesHMR(app: App) {
  const pages = app.files.pages;
  const errors = app.files.errors;
  const layouts = app.files.layouts;
  const endpoints = app.files.endpoints;
  const server = app.vite.server!;

  const isPage = (filePath) => pages.is(filePath);
  const isError = (filePath) => errors.is(filePath);
  const isLayout = (filePath) => layouts.is(filePath);
  const isEndpoint = (filePath) => endpoints.is(filePath);

  const pageLikeFiles = [
    [isPage, pages],
    [isError, errors],
  ] as const;

  function clearLayoutChildrenMarkdownCache(layoutFilePath: string) {
    const layoutIndex = layouts.findIndex(layoutFilePath);
    for (const page of pages) {
      if (page.layouts.includes(layoutIndex)) {
        clearMarkdownCache(page.path);
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

  for (const [is, files] of pageLikeFiles) {
    onFileEvent(is, 'add', async (filePath) => {
      files.add(filePath);
      return { reload: true };
    });

    onFileEvent(is, 'unlink', async (filePath) => {
      files.remove(filePath);
      return { reload: true };
    });

    onFileEvent(is, 'change', async (filePath) => {
      const file = files.find(filePath);

      if (!file) {
        files.remove(filePath);
        return { reload: true };
      }

      return null;
    });
  }

  onFileEvent(isLayout, 'add', async (filePath) => {
    layouts.add(filePath);
    clearLayoutChildrenMarkdownCache(filePath);
    return { reload: true };
  });

  onFileEvent(isLayout, 'change', async (filePath) => {
    const layout = layouts.find(filePath);

    if (!layout) {
      layouts.remove(filePath);
      return { reload: true };
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
    invalidateModuleByID(virtualModuleRequestPath.manifest);
    server.ws.send({ type: 'full-reload' });
  }

  function invalidateModuleByID(id: string) {
    const mod = server.moduleGraph.getModuleById(id);
    if (mod) server.moduleGraph.invalidateModule(mod);
  }
}

export function invalidatePageModule(server: ViteDevServer, page: PageFile) {
  const module = server.moduleGraph
    .getModulesByFile(page.path)
    ?.values()
    .next();

  if (module?.value) server.moduleGraph.invalidateModule(module.value);
}
