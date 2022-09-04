import type { App } from 'node/app/App';

import { virtualModuleRequestPath } from '../alias';
import type { VitebookPlugin } from '../Plugin';
import { loadLayoutsModule, loadPagesModule } from './load';
import { handleNodesHMR } from './nodes-hmr';

export function nodesPlugin(): VitebookPlugin {
  let app: App;

  return {
    name: '@vitebook/nodes',
    enforce: 'pre',
    vitebook: {
      async configureApp(_app) {
        app = _app;
        await app.nodes.init(app);
      },
    },
    async configureServer(server) {
      server.watcher.add(app.dirs.app.path);
      handleNodesHMR(app);
    },
    async load(id) {
      if (id === virtualModuleRequestPath.pages) {
        return loadPagesModule(app.nodes.pages.toArray());
      }

      if (id === virtualModuleRequestPath.layouts) {
        return loadLayoutsModule(app.nodes.layouts.toArray());
      }

      return null;
    },
  };
}
