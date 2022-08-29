import type { IncomingMessage, ServerResponse } from 'node:http';

import { httpError, isHTTPError } from './errors';
import { getRequest, setResponse } from './http-bridge';
import { handleRequest, type RequestModule } from './request';
import { json } from './response';

export function createHTTPRequestHandler(
  urlPattern: () => URLPattern,
  loader: () => RequestModule | Promise<RequestModule>,
  options?: {
    methods?: HTTPMethod[];
    getBase?: (req: IncomingMessage) => string;
    getClientAddress?: (req: IncomingMessage) => unknown;
    handleUnknownError?: HTTPErrorHandler;
    installPolyfills?: () => Promise<void>;
  },
) {
  let _pattern: URLPattern;

  const _getBase = options?.getBase ?? ((req) => `https://${req.headers.host}`);
  const _getClientAddress = options?.getClientAddress ?? ((req) => req.socket);

  const _handleUnknownError =
    options?.handleUnknownError ??
    ((_, res) => {
      setResponse(
        res,
        json({ error: { message: 'internal server error' } }, 500),
      );
    });

  return async (req: IncomingMessage, res: ServerResponse) => {
    await options?.installPolyfills?.();

    let request: Request;

    try {
      try {
        request = await getRequest(_getBase(req), req);
      } catch (error) {
        throw httpError('invalid request body', 400);
      }

      const response = await handleRequest(
        request,
        (_pattern ??= urlPattern()),
        () => _getClientAddress(req),
        loader,
        options?.methods,
      );

      setResponse(res, response);
    } catch (error) {
      if (isHTTPError(error)) {
        setResponse(res, handleHTTPError(error));
      } else {
        _handleUnknownError(req, res, error);
      }
    }
  };
}

export function handleHTTPError(error: unknown) {
  if (isHTTPError(error)) {
    return json(
      { error: { message: error.message, data: error.data } },
      error.init,
    );
  } else {
    return json({ error: { message: 'internal server error' } }, 500);
  }
}

export const HTTP_METHODS: Set<string> = new Set([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
]);

export type HTTPMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type HTTPErrorHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  error: unknown,
) => void;
