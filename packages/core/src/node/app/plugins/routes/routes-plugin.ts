import { virtualModuleRequestPath } from '../../alias';
import type { App } from '../../App';
import type { VitebookPlugin } from '../Plugin';
import { loadLayoutsModule, loadPagesModule } from './load';
import { handlePagesHMR } from './pages-hmr';

export function routesPlugin(): VitebookPlugin {
  let app: App;

  return {
    name: '@vitebook/routes',
    enforce: 'pre',
    vitebook: {
      async configureApp(_app) {
        app = _app;
        await app.routes.init(app);
      },
    },
    async configureServer(server) {
      server.watcher.add(app.dirs.routes.path);
      handlePagesHMR(app);
    },
    async load(id) {
      if (id === virtualModuleRequestPath.pages) {
        return loadPagesModule(app.routes.pages);
      }

      if (id === virtualModuleRequestPath.layouts) {
        return loadLayoutsModule(app.routes.layouts);
      }

      return null;
    },
  };
}
