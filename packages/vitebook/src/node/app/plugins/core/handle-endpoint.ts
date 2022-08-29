import type { IncomingMessage, ServerResponse } from 'node:http';

import { matchRouteInfo, type ServerEndpoint } from '../../../../shared';
import { App } from '../../App';
import {
  createHTTPRequestHandler,
  handleHTTPError,
  httpError,
  type RequestModule,
} from '../../http';
import { setResponse } from '../../http/http-bridge';

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
