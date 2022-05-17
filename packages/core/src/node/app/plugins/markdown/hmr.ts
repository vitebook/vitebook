import { normalizePath, type ViteDevServer } from 'vite';

import { Pages } from '../pages';
import { type MarkdocSchema } from './MarkdocSchema';
import { clearMarkdownCache } from './parseMarkdown';

export type MarkdownHMRConfig = {
  pages: Pages;
  markdoc: MarkdocSchema;
  server: ViteDevServer;
};

export function handleHMR({ pages, markdoc, server }: MarkdownHMRConfig) {
  const isNode = (filePath) => markdoc.isAnyNode(filePath);

  onFileEvent(isNode, 'add', async (filePath) => {
    markdoc.addNode(filePath);

    for (const page of pages.getPages()) {
      if (markdoc.nodeBelongsTo(filePath, page.filePath)) {
        clearMarkdownCache(page.filePath);
        invalidateFile(page.filePath);
      }
    }

    return { reload: true };
  });

  onFileEvent(isNode, 'unlink', async (filePath) => {
    markdoc.removeNode(filePath);

    const files = markdoc.affectedFiles.get(filePath);

    if (files) {
      for (const file of files) {
        clearMarkdownCache(file);
        invalidateFile(file);
      }
    }

    markdoc.affectedFiles.delete(filePath);
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
        server.ws.send({ type: 'full-reload' });
      }
    });
  }

  function invalidateFile(filePath: string) {
    server.moduleGraph
      .getModulesByFile(filePath)
      ?.forEach((mod) => server.moduleGraph.invalidateModule(mod));
  }
}
