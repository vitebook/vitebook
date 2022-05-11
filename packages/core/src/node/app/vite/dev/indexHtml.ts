import fs from 'fs-extra';
import { send, ViteDevServer } from 'vite';

import { cleanUrl } from '../../../../shared';
import type { App } from '../../App';

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

const defaultHTML = `
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="generator" content="vitebook@{{ version }}" />
    <!--@vitebook/head-->
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="app"><!--@vitebook/app--></div>
    <!--@vitebook/body-->
  </body>
</html>
`;

export function readIndexHtmlFile(app: App, { dev = true } = {}): string {
  const indexPath = app.dirs.root.resolve('index.html');

  let html = fs.existsSync(indexPath)
    ? fs.readFileSync(indexPath, 'utf-8')
    : defaultHTML;

  if (dev) {
    html = html.replace(
      '<!--@vitebook/head-->',
      '<script type="module" src="/:virtual/vitebook/client"></script>\n\t<!--@vitebook/head-->',
    );
  }

  return html.replace('{{ version }}', app.version);
}
