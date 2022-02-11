import { send, ViteDevServer } from 'vite';

import { cleanUrl } from '../../../../../shared';
import { fs } from '../../../../utils/fs';
import type { App } from '../../../App';

/**
 * @see https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/indexHtml.ts
 */
export const indexHtmlMiddleware =
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  (app: App, server: ViteDevServer) => async (req, res, next) => {
    const url = req.url && cleanUrl(req.url);
    if (url?.endsWith('.html')) {
      try {
        let html = readIndexHtmlFile(app);
        html = await server.transformIndexHtml(req.url, html, req.originalUrl);
        return send(req, res, html, 'html', {});
      } catch (e) {
        return next(e);
      }
    }

    next();
  };

export function readIndexHtmlFile(app: App): string {
  const indexPath = app.dirs.config.resolve('index.html');

  let html = fs.readFileSync(indexPath, 'utf-8');

  html = html.replace(
    '<!--@vitebook/head-->',
    '<script type="module" src="/:virtual/vitebook/client"></script>\n\t<!--@vitebook/head-->',
  );

  return html.replace('{{ version }}', app.version);
}
