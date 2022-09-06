import type { App } from 'node/app/App';
import { handleHTTPRequest } from 'node/http';
import { setResponse } from 'node/http/http-bridge';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { matchRouteInfo } from 'router';
import {
  createEndpointHandler,
  handleHTTPError,
  httpError,
  type RequestModule,
} from 'server/http';
import type { ServerEndpointFile } from 'server/types';
import { coalesceToError } from 'shared/utils/error';

import { handleDevServerError, logDevError } from './dev-server';

export async function handleEndpointRequest(
  base: string,
  url: URL,
  app: App,
  req: IncomingMessage,
  res: ServerResponse,
  loader: (endpoint: ServerEndpointFile) => Promise<RequestModule>,
) {
  const match = matchRouteInfo(url, app.files.endpoints.toArray());

  if (!match) {
    await setResponse(res, handleHTTPError(httpError('not found', 400)));
    return;
  }

  const endpoint = app.files.endpoints.getByIndex(match.index);

  const handler = createEndpointHandler({
    pattern: endpoint.route.pattern,
    loader: () => loader(endpoint),
    getClientAddress: () => req.socket.remoteAddress,
    onError: (error) => {
      logDevError(app, req, coalesceToError(error));
    },
  });

  try {
    await handleHTTPRequest(base, req, res, handler, (error) => {
      logDevError(app, req, coalesceToError(error));
    });
  } catch (error) {
    handleDevServerError(app, req, res, error);
  }
}
