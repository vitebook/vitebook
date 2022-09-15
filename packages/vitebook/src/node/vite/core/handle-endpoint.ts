import type { App } from 'node/app/App';
import type { EndpointFile } from 'node/app/files';
import { handleHTTPRequest } from 'node/http';
import { setResponse } from 'node/http/http-bridge';
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  createEndpointHandler,
  handleHttpError,
  httpError,
  type HttpRequestModule,
} from 'server/http';
import { findRoute } from 'shared/routing';
import { coalesceToError } from 'shared/utils/error';

import { handleDevServerError, logDevError } from './dev-server';

export async function handleEndpointRequest(
  base: string,
  url: URL,
  app: App,
  req: IncomingMessage,
  res: ServerResponse,
  loader: (endpoint: EndpointFile) => Promise<HttpRequestModule>,
) {
  const route = findRoute(url, app.routes.endpoints.toArray());

  if (!route) {
    await setResponse(res, handleHttpError(httpError('not found', 400)));
    return;
  }

  const handler = createEndpointHandler({
    pattern: route.pattern,
    loader: () => loader(route.file),
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
