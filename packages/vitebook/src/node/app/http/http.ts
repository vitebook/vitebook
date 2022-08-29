import type { IncomingMessage, ServerResponse } from 'node:http';

import { isHTTPError, isHTTPJSONError } from './errors';
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
      res.statusCode = 500;
      res.end('Internal server error');
    });

  return async (req: IncomingMessage, res: ServerResponse) => {
    await options?.installPolyfills?.();

    let request: Request;

    try {
      request = await getRequest(_getBase(req), req);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.statusCode = error.status || 400;
      res.end(error.reason || 'Invalid request body');
      return;
    }

    try {
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
  if (isHTTPJSONError(error)) {
    return json(error.data, error.statusCode);
  } else if (isHTTPError(error)) {
    return new Response(error.message, { status: error.statusCode });
  } else {
    return new Response('Internal server error', { status: 500 });
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
