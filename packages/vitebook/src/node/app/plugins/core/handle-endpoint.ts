import type { IncomingMessage, ServerResponse } from 'node:http';

import { matchRouteInfo, type ServerEndpoint } from '../../../../shared';
import { App } from '../../App';
import { createHTTPRequestHandler, type RequestModule } from '../../http';

export async function handleEndpoint(
  base: string,
  url: URL,
  app: App,
  req: IncomingMessage,
  res: ServerResponse,
  loader: (endpoint: ServerEndpoint) => Promise<RequestModule>,
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
    () => loader(endpoint),
    {
      getBase: () => base,
      handleUnknownError(_req, _res, error) {
        throw error;
      },
    },
  );

  return handler(req, res);
}
