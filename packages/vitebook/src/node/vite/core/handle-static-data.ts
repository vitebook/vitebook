import type { ServerResponse } from 'http';
import type { App } from 'node/app/App';
import { createStaticLoaderInput } from 'server';
import type { ServerNodeLoader } from 'server/types';
import { parseStaticDataAssetURL } from 'shared/data';
import { matchRouteInfo } from 'shared/routing';

import { callStaticLoader } from './static-loader';

export async function handleStaticDataRequest(
  url: URL,
  app: App,
  res: ServerResponse,
) {
  const { url: dataUrl, layoutIndex } = parseStaticDataAssetURL(url);

  const match = matchRouteInfo(dataUrl, app.routes.pages.toArray());

  if (!match) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const route = app.routes.pages.getByIndex(match.index);

  const file =
    layoutIndex >= 0 ? app.files.layouts.getByIndex(layoutIndex) : route.file;

  const output = await callStaticLoader(
    app,
    file.path,
    createStaticLoaderInput(dataUrl, route),
    app.vite.server!.ssrLoadModule as ServerNodeLoader,
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
