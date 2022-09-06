import type { App } from 'node/app/App';
import { installPolyfills } from 'server/polyfills';
import type { ServerEndpointFile } from 'server/types';
import type { PreviewServerHook } from 'vite';

import { handleDevServerError } from './dev-server';
import { handleEndpointRequest } from './handle-endpoint';

export async function configurePreviewServer(
  app: App,
  server: Parameters<PreviewServerHook>[0],
) {
  await installPolyfills();

  const protocol =
    app.vite.resolved!.server.https || app.vite.resolved!.preview.https
      ? 'https'
      : 'http';

  const loader = (endpoint: ServerEndpointFile) => {
    return import(
      app.dirs.server
        .resolve(app.dirs.app.relative(endpoint.rootPath))
        .replace(/\.ts$/, '.js')
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

      if (
        !app.files.pages.test(decodedUrl, (page) => !page.is404) &&
        app.files.endpoints.test(decodedUrl)
      ) {
        await handleEndpointRequest(base, url, app, req, res, loader);
        return;
      }

      // TODO: handle dynamic pages here (SSR) -- load from manifest.
    } catch (error) {
      handleDevServerError(app, req, res, error);
      return;
    }

    next();
  });
}
