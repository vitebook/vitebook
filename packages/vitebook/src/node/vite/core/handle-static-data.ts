import type { ServerResponse } from 'http';
import type { App } from 'node/app/App';
import { createStaticLoaderInput } from 'server';
import type { ServerModuleLoader } from 'server/types';
import { testRoute } from 'shared/routing';
import { isString } from 'shared/utils/unit';

import { callStaticLoader } from './static-loader';

export async function handleStaticDataRequest(
  url: URL,
  app: App,
  res: ServerResponse,
) {
  const pathname = decodeURIComponent(url.searchParams.get('pathname')!),
    id = decodeURIComponent(url.searchParams.get('id')!);

  const dataURL = new URL(url);
  dataURL.pathname = pathname;

  const route = app.routes.client.find((route) => route.file.routePath === id);

  if (!route || !testRoute(dataURL, route)) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const output = await callStaticLoader(
    app,
    route.file.path,
    createStaticLoaderInput(dataURL, route),
    app.vite.server!.ssrLoadModule as ServerModuleLoader,
  );

  if (output.redirect) {
    res.setHeader(
      'X-Vitebook-Redirect',
      isString(output.redirect) ? output.redirect : output.redirect.path,
    );
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(output.data ?? {}));
}
