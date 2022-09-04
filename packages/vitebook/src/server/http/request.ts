import { httpError } from './errors';

export async function handleRequest(
  request: Request,
  urlPattern: URLPattern,
  getClientAddress: () => unknown,
  loader: () => RequestModule | Promise<RequestModule>,
  methods?: HTTPMethod[],
) {
  const methodOverride =
    request.method === 'POST'
      ? (await request.formData()).get('_method') // does this throw??
      : null;

  const method = (
    typeof methodOverride === 'string' ? methodOverride : request.method
  ) as HTTPMethod;

  if (methods && !methods.includes(method)) throw httpError('not found', 404);

  const url = new URL(request.url);
  if (!urlPattern.test(url)) throw httpError('not found', 404);

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

  const headers: ResponseHeaders = {};
  const cookies: string[] = [];
  const params = urlPattern.exec(url)?.pathname.groups ?? {};

  const response = await handler(
    createRequestEvent(
      request,
      url,
      params,
      getClientAddress,
      headers,
      cookies,
    ),
  );

  if (!(response instanceof Response)) {
    throw new Error(
      `Invalid return value from route handler at ${url.pathname}. Should return a \`Response\`.`,
    );
  }

  for (const name in headers) {
    const value = headers[name];
    if (value !== null) response.headers.set(name, value + '');
  }

  for (const cookie of cookies) {
    response.headers.append('set-cookie', cookie);
  }

  return response;
}

export function createRequestEvent<T extends RequestParams>(
  request: Request,
  url: URL,
  params: T,
  getClientAddress: () => unknown,
  headers: ResponseHeaders = {},
  cookies: string[] = [],
): RequestEvent<T> {
  return {
    get url() {
      return url;
    },
    get clientAddress() {
      const address = getClientAddress();
      if (typeof address !== 'string') {
        throw new Error('Could not determine `clientAddress`');
      }
      return address;
    },
    get params() {
      return params;
    },
    get request() {
      return request;
    },
    setHeaders(newHeaders) {
      for (const key in newHeaders) {
        const name = key.toLowerCase();
        const value = newHeaders[key];

        if (name === 'set-cookie') {
          const newCookies: string[] = Array.isArray(value)
            ? value
            : value
            ? [value + '']
            : [];

          for (const cookie of newCookies) {
            if (cookies.includes(cookie)) {
              throw new Error(
                `"${key}" header already has cookie with same value`,
              );
            }

            cookies.push(cookie);
          }
        } else if (name in headers) {
          throw new Error(`"${key}" header is already set`);
        } else if (typeof value !== 'string') {
          throw new Error(
            `"${key}" value must be a string (found ${typeof value}).`,
          );
        } else {
          headers[name] = value;
        }
      }
    },
  };
}

/** `string[]` is only for set-cookie, everything else must be type of `string` */
export type ResponseHeaders = Record<string, string | number | string[] | null>;

export type RequestParams = {
  [param: string]: string | undefined;
};

export interface RequestEvent<Params extends RequestParams = RequestParams> {
  /** WARNING: This can throw if the client address can't be determined.  */
  clientAddress: string;
  url: URL;
  params: Params;
  request: Request;
  setHeaders: (headers: ResponseHeaders) => void;
}

export interface RequestHandler<Params extends RequestParams = RequestParams> {
  (event: RequestEvent<Params>): Response | Promise<Response>;
}

export type RequestModule = {
  [httpMethod: string]: RequestHandler | undefined;
};

export type HTTPMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export const HTTP_METHODS: Set<string> = new Set([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
]);

function getAllowedMethods(mod: RequestModule) {
  const allowed: string[] = [];

  for (const method of HTTP_METHODS) {
    if (method in mod) allowed.push(method);
  }

  if (mod.GET || mod.HEAD) allowed.push('HEAD');

  return allowed;
}
