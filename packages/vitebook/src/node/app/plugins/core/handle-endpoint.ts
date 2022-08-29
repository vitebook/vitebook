import type { IncomingMessage, ServerResponse } from 'node:http';

import { matchRouteInfo } from '../../../../shared';
import { App } from '../../App';
import { createHTTPRequestHandler } from '../../http';

export async function handleEndpoint(
  base: string,
  url: URL,
  app: App,
  req: IncomingMessage,
  res: ServerResponse,
) {
  const match = matchRouteInfo(url, app.nodes.endpoints.toArray());

  if (!match) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const endpoint = app.nodes.endpoints.getByIndex(match.index);

  const handler = createHTTPRequestHandler(
    () => endpoint.route.pattern,
    () => app.vite.server!.ssrLoadModule(endpoint.filePath),
    {
      getBase: () => base,
      handleUnknownError(_req, _res, error) {
        throw error;
      },
    },
  );

  return handler(req, res);
}
