import { normalizePath } from '../../../utils';
import type { App } from '../../App';
import { clearMarkdownCache } from './parse-markdown';

export function handleMarkdownHMR(app: App) {
  const isNode = (filePath) => app.markdoc.isAnyNode(filePath);

  onFileEvent(isNode, 'add', async (filePath) => {
    app.markdoc.addNode(filePath);

    for (const page of app.routes.pages) {
      if (app.markdoc.doesNodeBelongToPage(filePath, page.filePath)) {
        clearMarkdownCache(page.filePath);
        invalidateFile(page.filePath);
      }
    }

    return { reload: true };
  });

  onFileEvent(isNode, 'unlink', async (filePath) => {
    app.markdoc.removeNode(filePath);

    const files = app.markdoc.affectedFiles.get(filePath);

    if (files) {
      for (const file of files) {
        clearMarkdownCache(file);
        invalidateFile(file);
      }
    }

    app.markdoc.affectedFiles.delete(filePath);
    return { reload: true };
  });

  function onFileEvent(
    test: (path: string) => boolean,
    eventName: string,
    handler: (path: string) => Promise<void | null | { reload?: boolean }>,
  ) {
    app.vite.server!.watcher.on(eventName, async (path) => {
      const filePath = normalizePath(path);

      if (!test(filePath)) return;

      const { reload } = (await handler(filePath)) ?? {};

      if (reload) {
        app.vite.server!.ws.send({ type: 'full-reload' });
      }
    });
  }

  function invalidateFile(filePath: string) {
    app.vite
      .server!.moduleGraph.getModulesByFile(filePath)
      ?.forEach((mod) => app.vite.server!.moduleGraph.invalidateModule(mod));
  }
}
