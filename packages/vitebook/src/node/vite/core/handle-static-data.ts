import type { ServerResponse } from 'http';
import type { App } from 'node/app/App';
import { matchRouteInfo } from 'router';
import { createStaticLoaderInput } from 'server';
import type { ServerNodeLoader } from 'server/types';
import { parseStaticDataAssetURL } from 'shared/data';

import { callStaticLoader } from './static-loader';

export async function handleStaticDataRequest(
  url: URL,
  app: App,
  res: ServerResponse,
) {
  const { url: route, layoutIndex } = parseStaticDataAssetURL(url);

  const match = matchRouteInfo(route, app.files.pages.toArray());

  if (!match) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const page = app.files.pages.getByIndex(match.index);
  const module =
    layoutIndex >= 0 ? app.files.layouts.getByIndex(layoutIndex) : page;

  const output = await callStaticLoader(
    app,
    module.filePath,
    createStaticLoaderInput(route, page),
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
