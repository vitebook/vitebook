import type { ServerRequestHandler } from 'server/types';
import { isHttpError } from 'shared/routing';

import { handleHttpError, httpError } from './errors';
import {
  createRequestEvent,
  getAllowedMethods,
  HttpMethod,
  type HttpRequestModule,
} from './request';

export type EndpointHandlerInit = {
  pattern: URLPattern;
  methods?: HttpMethod[];
  loader: () => HttpRequestModule | Promise<HttpRequestModule>;
  getClientAddress: (request: Request) => unknown;
  onError?: (error: unknown) => void;
};

export function createEndpointHandler(
  init: EndpointHandlerInit,
): ServerRequestHandler {
  const { pattern, methods, loader, getClientAddress, onError } = init;

  return async (request) => {
    try {
      const methodOverride =
        request.method === 'POST'
          ? (await request.formData()).get('_method')
          : null;

      const method = (
        typeof methodOverride === 'string' ? methodOverride : request.method
      ) as HttpMethod;

      if (methods && !methods.includes(method)) {
        throw httpError('not found', 404);
      }

      const url = new URL(request.url);

      if (!pattern.test(url)) {
        throw httpError('not found', 404);
      }

      const mod = await loader();

      let handler = mod[method];
      if (!handler && method === 'HEAD') handler = mod.GET;
      if (!handler) handler = mod.ANY;

      if (!handler) {
        throw httpError(`${method} method not allowed`, {
          status: 405,
          headers: {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405
            // "The server must generate an Allow header field in a 405 status code response"
            allow: getAllowedMethods(mod).join(', '),
          },
        });
      }

      const params = pattern.exec(url)?.pathname.groups ?? {};

      const response = await handler(
        createRequestEvent({
          request,
          url,
          params,
          getClientAddress: () => getClientAddress(request),
        }),
      );

      if (!(response instanceof Response)) {
        throw new Error(
          `Invalid return value from route handler at ${url.pathname}. Should return a \`Response\`.`,
        );
      }

      return response;
    } catch (error) {
      if (isHttpError(error)) {
        return handleHttpError(error);
      } else if (error instanceof Response) {
        return error;
      } else {
        onError?.(error);
        return handleHttpError(httpError('internal server error', 500));
      }
    }
  };
}
