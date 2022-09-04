import type { ServerResponse } from 'http';
import type { App } from 'node/app/App';
import { matchRouteInfo } from 'router';
import { parseStaticDataAssetURL } from 'shared/data';

import { callStaticLoader, createStaticLoaderInput } from './static-loader';

export async function handleStaticDataRequest(
  url: URL,
  app: App,
  res: ServerResponse,
) {
  const { url: route, layoutIndex } = parseStaticDataAssetURL(url);

  const match = matchRouteInfo(route, app.nodes.pages.toArray());

  if (!match) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const page = app.nodes.pages.getByIndex(match.index);
  const module =
    layoutIndex >= 0 ? app.nodes.layouts.getByIndex(layoutIndex) : page;

  const output = await callStaticLoader(
    app,
    module.filePath,
    createStaticLoaderInput(route, page),
    app.vite.server!.ssrLoadModule,
  );

  if (output.redirect) {
    output.data = {
      ...output.data,
      __redirect__: output.redirect,
    };
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(output.data ?? {}));
}
