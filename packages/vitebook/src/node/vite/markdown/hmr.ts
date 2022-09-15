import type { App } from 'node/app/App';
import { clearMarkdownCache } from 'node/markdoc';
import { normalizePath } from 'node/utils';

export function handleMarkdownHMR(app: App) {
  const schema = app.markdoc;
  const nodes = app.files.markdoc;
  const isNode = (filePath) => nodes.isAnyNode(filePath);

  onFileEvent(isNode, 'add', async (filePath) => {
    nodes.add(filePath);

    for (const pageFile of app.files.pages) {
      if (nodes.isSameBranch(filePath, pageFile.path)) {
        clearMarkdownCache(pageFile.path);
        invalidateFile(pageFile.path);
      }
    }

    return { reload: true };
  });

  onFileEvent(isNode, 'unlink', async (filePath) => {
    nodes.remove(filePath);

    const files = schema.hmrFiles.get(filePath);

    if (files) {
      for (const file of files) {
        clearMarkdownCache(file);
        invalidateFile(file);
      }
    }

    schema.hmrFiles.delete(filePath);
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
