import { type ServerResponse } from 'http';
import { type ViteDevServer } from 'vite';

import { matchRouteInfo, parseDataAssetURL } from '../../../../shared';
import { type App } from '../../App';
import { buildServerLoaderInput, runModuleServerLoader } from './serverLoader';

export async function handleDataRequest(
  url: URL,
  app: App,
  server: ViteDevServer,
  res: ServerResponse,
) {
  const { url: route, layoutIndex } = parseDataAssetURL(url);

  const match = matchRouteInfo(route, app.pages.all);
  const page = app.pages.all[match?.index ?? -1];

  const module =
    layoutIndex >= 0 ? app.pages.getLayoutByIndex(layoutIndex) : page;

  if (!page || !module) {
    res.statusCode = 404;
    res.end('Not found.');
    return;
  }

  const output = await runModuleServerLoader(
    app,
    module.filePath,
    buildServerLoaderInput(route, page),
    server.ssrLoadModule,
  );

  if (output.redirect) {
    output.data = { ...output.data, __redirect__: output.redirect };
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(output.data ?? {}));
}
