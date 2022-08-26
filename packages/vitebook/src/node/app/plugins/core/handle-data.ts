import { type ServerResponse } from 'http';

import { matchRouteInfo, parseDataAssetURL } from '../../../../shared';
import { type App } from '../../App';
import { buildServerLoaderInput, runModuleServerLoader } from './server-loader';

export async function handleDataRequest(
  url: URL,
  app: App,
  res: ServerResponse,
) {
  const { url: route, layoutIndex } = parseDataAssetURL(url);

  const match = matchRouteInfo(route, app.nodes.pages.toArray());

  if (!match) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const page = app.nodes.pages.getByIndex(match.index);
  const module =
    layoutIndex >= 0 ? app.nodes.layouts.getByIndex(layoutIndex) : page;

  const output = await runModuleServerLoader(
    app,
    module.filePath,
    buildServerLoaderInput(route, page),
    app.vite.server!.ssrLoadModule,
  );

  if (output.redirect) {
    output.data = { ...output.data, __redirect__: output.redirect };
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(output.data ?? {}));
}
