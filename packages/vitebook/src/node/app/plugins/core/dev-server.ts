import kleur from 'kleur';
import { type ViteDevServer } from 'vite';

import {
  coalesceToError,
  DATA_ASSET_BASE_PATH,
  noendslash,
} from '../../../../shared';
import { type App } from '../../App';
import { handleDataRequest } from './handle-data';
import { handleEndpoint } from './handle-endpoint';
import { handlePageRequest } from './handle-page';

export function configureDevServer(app: App, server: ViteDevServer) {
  removeHtmlMiddlewares(server.middlewares);

  const fetch = globalThis.fetch;
  const protocol = server.config.server.https ? 'https' : 'http';

  // Ensure devs can call local API endpoints using relative paths (e.g., `fetch('/api/foo')`).
  let origin: string;
  globalThis.fetch = (input, init) => {
    return fetch(
      typeof input === 'string' && input.startsWith('/api')
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

      if (decodedUrl.startsWith('/api')) {
        return await handleEndpoint(base, url, app, req, res);
      }

      if (decodedUrl.startsWith(DATA_ASSET_BASE_PATH)) {
        return await handleDataRequest(url, app, res);
      }

      if (decodedUrl.endsWith('/') || decodedUrl.endsWith('.html')) {
        url.pathname = url.pathname.replace('/index.html', '/');
        return await handlePageRequest(url, app, req, res);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e) {
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
