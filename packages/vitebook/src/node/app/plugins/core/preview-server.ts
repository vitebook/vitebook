import { type PreviewServerHook } from 'vite';

import { type ServerEndpoint } from '../../../../shared';
import { type App } from '../../App';
import { installPolyfills } from '../../http/polyfills';
import { handleDevServerError } from './dev-server';
import { handleEndpoint } from './handle-endpoint';

export async function configurePreviewServer(
  app: App,
  server: Parameters<PreviewServerHook>[0],
) {
  await installPolyfills();

  const protocol =
    app.vite.resolved!.server.https || app.vite.resolved!.preview.https
      ? 'https'
      : 'http';

  const loader = (endpoint: ServerEndpoint) => {
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
        !app.nodes.pages.test(decodedUrl) &&
        app.nodes.endpoints.test(decodedUrl)
      ) {
        await handleEndpoint(base, url, app, req, res, loader);
        return;
      }
    } catch (error) {
      handleDevServerError(app, req, res, error);
      return;
    }

    next();
  });
}
