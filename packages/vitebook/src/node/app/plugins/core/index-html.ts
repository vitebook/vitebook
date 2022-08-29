import fs from 'node:fs';

import { type App } from '../../App';

export const DEFAULT_INDEX_HTML = `
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
  const indexPath = app.dirs.app.resolve('index.html');

  let html = fs.existsSync(indexPath)
    ? fs.readFileSync(indexPath, 'utf-8')
    : DEFAULT_INDEX_HTML;

  if (dev) {
    html = html.replace(
      '<!--@vitebook/head-->',
      '<script type="module" src="/:virtual/vitebook/client"></script>\n\t<!--@vitebook/head-->',
    );
  }

  return html.replace('{{ version }}', app.version);
}
