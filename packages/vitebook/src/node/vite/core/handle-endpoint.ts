import type { App } from 'node/app/App';
import { createHTTPRequestHandler } from 'node/http';
import { setResponse } from 'node/http/http-bridge';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { matchRouteInfo } from 'router';
import { handleHTTPError, httpError, type RequestModule } from 'server/http';
import type { ServerEndpoint } from 'server/types';

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
    setResponse(res, handleHTTPError(httpError('not found', 400)));
    return;
  }

  const endpoint = app.nodes.endpoints.getByIndex(match.index);

  const handler = await createHTTPRequestHandler(
    () => endpoint.route.pattern,
    () => loader(endpoint),
    {
      getBase: () => base,
      handleUnknownError(_req, _res, error) {
        throw error;
      },
    },
  );

  await handler(req, res);
}
