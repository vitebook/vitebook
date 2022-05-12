import { virtualModuleRequestPath } from '../../alias';
import type { App } from '../../App';
import type { Plugin } from '../Plugin';
import { handleHMR } from './hmr';

export type PagesPluginOptions = {
  /**
   * Globs pointing to files to be included in Vitebook (relative to `<pages>`).
   */
  include?: string[];

  layouts?: {
    /**
     * Globs pointing to layout files to be included in Vitebook (relative to `<pages>`).
     */
    include?: string[];
  };
};

export function pagesPlugin(): Plugin {
  let app: App;

  return {
    name: '@vitebook/pages',
    enforce: 'pre',
    configureApp(_app: App) {
      app = _app;
    },
    async configureServer(server) {
      server.watcher.add(app.dirs.pages.path);
      handleHMR({ pages: app.pages, server });
    },
    async load(id) {
      if (id === virtualModuleRequestPath.pages) {
        return app.pages.loadPagesModule();
      }

      if (id === virtualModuleRequestPath.layouts) {
        return app.pages.loadLayoutsModule();
      }

      return null;
    },
  };
}
