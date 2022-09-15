import type { ServerManifest, ServerRequestHandler } from 'server/types';

export function createPageHandler(
  manifest: ServerManifest,
): ServerRequestHandler {
  return async (request) => {
    const url = new URL(request.url);

    let response: Response;

    if (url.searchParams.has('__data')) {
      response = handleDataRequest(url, request, manifest);
    } else {
      response = handlePageRequest(url, request, manifest);
    }

    if (request.method === 'HEAD') {
      return new Response(null, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      });
    }

    return response;
  };
}

export function handleDataRequest(
  url: URL,
  request: Request,
  manifest: ServerManifest,
): Response {
  // __data
  return {} as any;
}

export function handlePageRequest(
  url: URL,
  request: Request,
  manifest: ServerManifest,
): Response {
  // cache router (clear state)
  // this can be an action request
  // const { html: appHtml, head, router } = await render(url, { state, data: staticDataMap });
  // const html = template
  //   .replace(`<!--@vitebook/head-->`, head + styles)
  //   .replace(`<!--@vitebook/app-->`, appHtml)
  //   .replace('<!--@vitebook/body-->', staticDataScript);
  return {} as any;
}
