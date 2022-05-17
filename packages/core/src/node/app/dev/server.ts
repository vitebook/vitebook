import { createServer as createDevServer, ViteDevServer } from 'vite';

import type { App } from '../App';

export async function dev(app: App): Promise<ViteDevServer> {
  const { host, port, https, open, strictPort } = app.config.cliArgs;

  return createDevServer({
    root: app.dirs.root.path,
    ...app.vite,
    plugins: [...app.plugins, ...(app.vite?.config.plugins ?? [])],
    server: {
      ...app.vite?.config.server,
      host,
      port,
      https,
      open,
      strictPort,
    },
  });
}
