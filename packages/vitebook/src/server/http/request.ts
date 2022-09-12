export function createRequestEvent<T extends RequestParams>(
  init: RequestEventInit<T>,
): RequestEvent<T> {
  return {
    get url() {
      return init.url;
    },
    get clientAddress() {
      const address = init.getClientAddress();
      if (typeof address !== 'string') {
        throw new Error('Could not determine `clientAddress`');
      }
      return address;
    },
    get params() {
      return init.params;
    },
    get request() {
      return init.request;
    },
  };
}

export type RequestParams = {
  [param: string]: string | undefined;
};

export type RequestEventInit<T extends RequestParams> = {
  request: Request;
  url: URL;
  params: T;
  getClientAddress: () => unknown;
};

export interface RequestEvent<Params extends RequestParams = RequestParams> {
  /** WARNING: This can throw if the client address can't be determined.  */
  clientAddress: string;
  url: URL;
  params: Params;
  request: Request;
}

export interface RequestHandler<Params extends RequestParams = RequestParams> {
  (event: RequestEvent<Params>): Response | Promise<Response>;
}

export type RequestModule = {
  [httpMethod: string]: RequestHandler | undefined;
};

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export const HTTP_METHODS: Set<string> = new Set([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
]);

export function getAllowedMethods(mod: RequestModule) {
  const allowed: string[] = [];

  for (const method of HTTP_METHODS) {
    if (method in mod) allowed.push(method);
  }

  if (mod.GET || mod.HEAD) allowed.push('HEAD');

  return allowed;
}
