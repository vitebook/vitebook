import kleur from 'kleur';
import type { App } from 'node/app/App';
import type { EndpointFile } from 'node/app/files';
import type { ServerResponse } from 'node:http';
import { STATIC_DATA_ASSET_BASE_PATH } from 'shared/data';
import { coalesceToError } from 'shared/utils/error';
import { noendslash } from 'shared/utils/url';
import type { Connect, ViteDevServer } from 'vite';

import { handleEndpointRequest } from './handle-endpoint';
import { handlePageRequest } from './handle-page';
import { handleStaticDataRequest } from './handle-static-data';

export function configureDevServer(app: App, server: ViteDevServer) {
  removeHtmlMiddlewares(server.middlewares);

  const endpointLoader = (endpoint: EndpointFile) =>
    app.vite.server!.ssrLoadModule(endpoint.path);

  // Ensure devs can call local API endpoints using relative paths (e.g., `fetch('/api/foo')`).
  let origin: string;

  const fetch = globalThis.fetch;
  const protocol = server.config.server.https ? 'https' : 'http';

  globalThis.fetch = (input, init) => {
    return fetch(
      typeof input === 'string' && app.routes.endpoints.test(input)
        ? `${(origin ??= noendslash(
            server.resolvedUrls?.local[0] ?? `${protocol}://localhost:5173`,
          ))}${input}`
        : input,
      init,
    );
  };

  server.middlewares.use(async (req, res, next) => {
    try {
      if (!req.url || !req.method) {
        throw new Error('Incomplete request');
      }

      const base = `${protocol}://${
        req.headers[':authority'] || req.headers.host
      }`;

      const url = new URL(base + req.url);
      const decodedUrl = decodeURI(new URL(base + req.url).pathname);

      if (decodedUrl.startsWith(STATIC_DATA_ASSET_BASE_PATH)) {
        return await handleStaticDataRequest(url, app, res);
      }

      if (app.routes.pages.test(decodedUrl)) {
        return await handlePageRequest(base, url, app, req, res);
      }

      if (app.routes.endpoints.test(decodedUrl)) {
        return await handleEndpointRequest(
          base,
          url,
          app,
          req,
          res,
          endpointLoader,
        );
      }
    } catch (error) {
      handleDevServerError(app, req, res, error);
      return;
    }

    next();
  });
}

function removeHtmlMiddlewares(server) {
  const middlewares = ['viteIndexHtmlMiddleware', 'viteSpaFallbackMiddleware'];
  for (let i = server.stack.length - 1; i > 0; i--) {
    if (middlewares.includes(server.stack[i].handle.name)) {
      server.stack.splice(i, 1);
    }
  }
}

export function logDevError(
  app: App,
  req: Connect.IncomingMessage,
  error: Error,
) {
  app.logger.error(
    error.message,
    [
      `\n${kleur.bold('URL:')} ${req.url ?? '?'}`,
      `${kleur.bold('METHOD:')} ${req.method ?? '?'}`,
      '',
      '',
    ].join('\n'),
    error.stack,
    '\n',
  );
}

export function handleDevServerError(
  app: App,
  req: Connect.IncomingMessage,
  res: ServerResponse,
  e: unknown,
) {
  const error = coalesceToError(e);
  logDevError(app, req, error);
  res.statusCode = 500;
  res.end(error.stack);
}
