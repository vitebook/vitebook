import { ServerResponse } from 'http';
import { type ViteDevServer } from 'vite';

import { matchRouteInfo, parseDataAssetURL } from '../../../../shared';
import { type App } from '../../App';
import { buildServerLoaderInput, loadModuleData } from './dataLoader';

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

  const data = await loadModuleData(
    app,
    module.filePath,
    buildServerLoaderInput(route, page),
    server.ssrLoadModule,
  );

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
