import type { ServerBuild, ServerRequestHandler } from 'server/types';

export function createPageHandler(build: ServerBuild): ServerRequestHandler {
  // Save anything we need across subsequent requests here.
  const shared: Record<string, any> = {};

  return async (request) => {
    const url = new URL(request.url);

    let response: Response;

    if (url.searchParams.has('__data')) {
      response = handleDataRequest(url, request, build);
    } else {
      response = handlePageRequest(url, request, build, shared);
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
  build: ServerBuild,
): Response {
  // __data = layout index or -1 for page
  // this can be either an action or
}

export function handlePageRequest(
  url: URL,
  request: Request,
  build: ServerBuild,
  shared: Record<string, any>,
): Response {
  // cache router (clear state)
  // this can be an action request
  // const { html: appHtml, head, router } = await render(url, { state, data: staticDataMap });
  // const html = template
  //   .replace(`<!--@vitebook/head-->`, head + styles)
  //   .replace(`<!--@vitebook/app-->`, appHtml)
  //   .replace('<!--@vitebook/body-->', staticDataScript);
}
