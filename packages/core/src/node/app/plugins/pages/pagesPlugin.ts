import { virtualModuleRequestPath } from '../../alias';
import type { App } from '../../App';
import type { Plugin } from '../Plugin';
import { handleHMR } from './hmr';

export type ResolvedPagesPluginConfig = {
  /**
   * Globs pointing to files to be included in Vitebook (relative to `<pages>`).
   */
  include: string[];

  layouts: {
    /**
     * Globs pointing to layout files to be included in Vitebook (relative to `<pages>`).
     */
    include: string[];
  };
};

export type PagesPluginConfig = Partial<
  Omit<ResolvedPagesPluginConfig, 'layouts'>
> & {
  layouts?: Partial<ResolvedPagesPluginConfig['layouts']>;
};

export function pagesPlugin(config: ResolvedPagesPluginConfig): Plugin {
  let app: App;

  const { include, layouts } = config;

  return {
    name: '@vitebook/pages',
    enforce: 'pre',
    async vitebookInit(_app: App) {
      app = _app;

      await app.pages.init({
        dirs: {
          root: app.dirs.root.path,
          pages: app.dirs.pages.path,
        },
        include: {
          pages: include,
          layouts: layouts.include,
        },
      });

      await app.pages.discover();
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
