import type { App } from 'node/app/App';
import { prettyJsonStr, stripImportQuotesFromJson } from 'shared/utils/json';

import { virtualModuleRequestPath } from '../alias';
import type { VitebookPlugin } from '../Plugin';
import { handleFilesHMR } from './files-hmr';

export function filesPlugin(): VitebookPlugin {
  let app: App;

  return {
    name: '@vitebook/files',
    enforce: 'pre',
    vitebook: {
      async configureApp(_app) {
        app = _app;
        await app.files.init(app);
        await app.routes.init(app);
      },
    },
    async configureServer(server) {
      server.watcher.add(app.dirs.app.path);
      handleFilesHMR(app);
    },
    async load(id) {
      if (id === virtualModuleRequestPath.routes) {
        return loadRoutesModule(app);
      }

      return null;
    },
  };
}

export function loadRoutesModule(app: App) {
  return `export default ${stripImportQuotesFromJson(
    prettyJsonStr(
      {},
      // pages.map((page) => ({
      //   rootPath: page.rootPath,
      //   route: {
      //     ...page.route,
      //     // initialized late on client to allow polyfill to be installed.
      //     pattern: undefined,
      //   },
      //   ext: page.ext,
      //   layouts: page.layouts,
      //   loader: `() => import('${page.id}')`,
      // })),
    ),
  )}`;
}
