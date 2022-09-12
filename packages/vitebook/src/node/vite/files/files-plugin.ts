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
      if (id === virtualModuleRequestPath.manifest) {
        return loadClientManifestModule(app);
      }

      return null;
    },
  };
}

export function loadClientManifestModule(app: App) {
  const routes = app.routes.all;

  const loaders = routes.map(
    (node) => `() => import('/${node.file.rootPath}')`,
  );

  // We'll replace production version after chunks are built so we can be sure `serverLoader`
  // exists for a given chunk. This is not used during dev.
  const fetch = app.config.isBuild ? '__VBK_CAN_FETCH__' : [];

  const _routes: {
    i?: string;
    p: number;
    m: number;
    l?: 1;
    e?: 1;
  }[] = [];

  const paths: [pathname: string, score: number][] = [];

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];

    let pathIndex = paths.findIndex(
      (p) => p[0] === route.pathname && p[1] === route.score,
    );

    if (pathIndex === -1) {
      paths.push([route.pathname, route.score]);
      pathIndex = paths.length - 1;
    }

    _routes.push({
      i: !app.config.isBuild ? route.file.rootPath : undefined,
      p: pathIndex,
      m: i,
      l: route.layout ? 1 : undefined,
      e: route.error ? 1 : undefined,
    });
  }

  return `export default ${stripImportQuotesFromJson(
    prettyJsonStr({
      paths,
      loaders,
      fetch,
      routes: _routes,
    }),
  )};`;
}
