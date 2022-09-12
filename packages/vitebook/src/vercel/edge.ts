// import {
//   createEndpointHandler,
//   type HttpMethod,
//   type RequestModule,
// } from 'server';

// TODO: createRequestHandler

// export type VercelEdgeEndpointHandlerInit = {
//   pattern: URLPattern;
//   loader: () => RequestModule | Promise<RequestModule>;
//   methods?: HttpMethod[];
// };

// export function createEndpointHandler(init: VercelEdgeEndpointHandlerInit) {
//   return createEndpointHandler({
//     ...init,
//     getClientAddress: (request) => request.headers.get('x-forwarded-for'),
//   });
// }

export {};
