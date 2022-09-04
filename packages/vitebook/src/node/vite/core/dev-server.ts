import kleur from 'kleur';
import type { App } from 'node/app/App';
import type { ServerResponse } from 'node:http';
import type { ServerEndpoint } from 'server/types';
import { STATIC_DATA_ASSET_BASE_PATH } from 'shared/data';
import { coalesceToError } from 'shared/utils/error';
import { noendslash } from 'shared/utils/url';
import type { Connect, ViteDevServer } from 'vite';

import { handleEndpoint } from './handle-endpoint';
import { handlePageRequest } from './handle-page';
import { handleStaticDataRequest } from './handle-static-data';

export function configureDevServer(app: App, server: ViteDevServer) {
  removeHtmlMiddlewares(server.middlewares);

  const loader = (endpoint: ServerEndpoint) =>
    app.vite.server!.ssrLoadModule(endpoint.filePath);

  // Ensure devs can call local API endpoints using relative paths (e.g., `fetch('/api/foo')`).
  let origin: string;

  const fetch = globalThis.fetch;
  const protocol = server.config.server.https ? 'https' : 'http';

  globalThis.fetch = (input, init) => {
    return fetch(
      typeof input === 'string' && app.nodes.endpoints.test(input)
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

      if (app.nodes.pages.test(decodedUrl)) {
        url.pathname = url.pathname.replace('/index.html', '/');
        return await handlePageRequest(url, app, req, res);
      }

      if (app.nodes.endpoints.test(decodedUrl)) {
        return await handleEndpoint(base, url, app, req, res, loader);
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

export function handleDevServerError(
  app: App,
  req: Connect.IncomingMessage,
  res: ServerResponse,
  e: unknown,
) {
  const error = coalesceToError(e);

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

  res.statusCode = 500;
  res.end(error.stack);
}
