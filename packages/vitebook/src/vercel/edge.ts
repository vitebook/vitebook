import {
  createEndpointHandler,
  type HTTPMethod,
  type RequestModule,
} from 'server';

// TODO: createRequestHandler

export type VercelEdgeEndpointHandlerInit = {
  pattern: URLPattern;
  loader: () => RequestModule | Promise<RequestModule>;
  methods?: HTTPMethod[];
};

export function createEndpointHandler(init: VercelEdgeEndpointHandlerInit) {
  return createEndpointHandler({
    ...init,
    getClientAddress: (request) => request.headers.get('x-forwarded-for'),
  });
}
