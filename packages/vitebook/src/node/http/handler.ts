import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  handleHTTPError,
  handleRequest,
  httpError,
  type HTTPMethod,
  isHTTPError,
  json,
  type RequestModule,
} from 'server/http';

import { getRequest, setResponse } from './http-bridge';

export function createHTTPRequestHandler(
  urlPattern: () => URLPattern,
  loader: () => RequestModule | Promise<RequestModule>,
  options?: {
    methods?: HTTPMethod[];
    install?: () => Promise<void>;
    getBase?: (req: IncomingMessage) => string;
    getClientAddress?: (req: IncomingMessage) => unknown;
    handleUnknownError?: HTTPErrorHandler;
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
    await options?.install?.();

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
      } else if (error instanceof Response) {
        setResponse(res, error);
      } else {
        _handleUnknownError(req, res, error);
      }
    }
  };
}

export type HTTPErrorHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  error: unknown,
) => void;
