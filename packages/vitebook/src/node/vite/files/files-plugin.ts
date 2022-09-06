import type { App } from 'node/app/App';

import { virtualModuleRequestPath } from '../alias';
import type { VitebookPlugin } from '../Plugin';
import { handleFilesHMR } from './files-hmr';
import { loadLayoutsModule, loadPagesModule } from './load';

export function filesPlugin(): VitebookPlugin {
  let app: App;

  return {
    name: '@vitebook/nodes',
    enforce: 'pre',
    vitebook: {
      async configureApp(_app) {
        app = _app;
        await app.files.init(app);
      },
    },
    async configureServer(server) {
      server.watcher.add(app.dirs.app.path);
      handleFilesHMR(app);
    },
    async load(id) {
      if (id === virtualModuleRequestPath.pages) {
        return loadPagesModule(app.files.pages.toArray());
      }

      if (id === virtualModuleRequestPath.layouts) {
        return loadLayoutsModule(app.files.layouts.toArray());
      }

      return null;
    },
  };
}
