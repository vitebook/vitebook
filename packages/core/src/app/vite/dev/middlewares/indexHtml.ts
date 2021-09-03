import { send, ViteDevServer } from 'vite';

import { fs } from '../../../../utils/fs.js';
import { currentDirectory } from '../../../../utils/module.js';
import { path } from '../../../../utils/path.js';
import type { App } from '../../../App.js';

/**
 * @see https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/indexHtml.ts
 */
export const indexHtmlMiddleware =
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  (app: App, server: ViteDevServer) => async (req, res, next) => {
    if (req.url?.endsWith('.html')) {
      try {
        let html = resolveIndexHtmlFile(app);
        html = await server.transformIndexHtml(req.url, html, req.originalUrl);
        return send(req, res, html, 'html');
      } catch (e) {
        return next(e);
      }
    }

    next();
  };

export function resolveIndexHtmlFile(app: App): string {
  const indexPath = path.resolve(
    currentDirectory(import.meta),
    '../../../../../index.html'
  );

  let html = fs.readFileSync(indexPath, 'utf-8');

  if (app.options.cliArgs.command === 'dev') {
    html = html.replace(
      '<!--preload-links-->',
      ' <script type="module" src="/@vitebook_virtual/core/client"></script>'
    );
  }

  return html.replace('{{ version }}', app.version);
}
