import { handleHTTPError, httpError, isHTTPError } from './errors';
import { handleRequest, type HTTPMethod, type RequestModule } from './request';

export function createEdgeRequestHandler(
  urlPattern: URLPattern,
  loader: () => RequestModule | Promise<RequestModule>,
  options?: {
    methods?: HTTPMethod[];
  },
) {
  return async (request: Request) => {
    try {
      return await handleRequest(
        request,
        urlPattern,
        () => request.headers.get('x-forwarded-for'),
        loader,
        options?.methods,
      );
    } catch (error) {
      return handleHTTPError(
        isHTTPError(error) ? error : httpError('internal server error', 500),
      );
    }
  };
}
