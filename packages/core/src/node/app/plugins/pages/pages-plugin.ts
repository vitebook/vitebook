import { virtualModuleRequestPath } from '../../alias';
import type { App } from '../../App';
import type { VitebookPlugin } from '../Plugin';
import { handleHMR } from './hmr';

export function pagesPlugin(): VitebookPlugin {
  let app: App;

  return {
    name: '@vitebook/pages',
    enforce: 'pre',
    vitebook: {
      async configureApp(_app) {
        app = _app;

        const config = app.config.pages;
        const { include, exclude, layouts } = config;

        await app.pages.configure({
          include,
          exclude,
          matchers: app.config.routes.matchers,
          dirs: {
            root: app.dirs.root.path,
            pages: app.dirs.pages.path,
          },
          layouts,
        });

        await app.pages.discover();
      },
    },
    async configureServer(server) {
      server.watcher.add(app.dirs.pages.path);
      handleHMR({ app, server });
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

export type ResolvedPagesPluginConfig = {
  /**
   * Globs indicating page files to be included in Vitebook (relative to `<pages>`).
   */
  include: string[];
  /**
   * Globs or RegExp indicating page files to be excluded from Vitebook (relative to `<pages>`).
   */
  exclude: (string | RegExp)[];

  layouts: {
    /**
     * Globs indicating layout files to be included in Vitebook (relative to `<pages>`).
     */
    include: string[];
    /**
     * Globs or RegExp indicating layout files to be excluded from Vitebook (relative to `<pages>`).
     */
    exclude: (string | RegExp)[];
  };
};

export type PagesPluginConfig = Partial<
  Omit<ResolvedPagesPluginConfig, 'layouts'>
> & {
  layouts?: Partial<ResolvedPagesPluginConfig['layouts']>;
};
