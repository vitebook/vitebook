import { createServer, ViteDevServer } from 'vite';

import type { App } from '../../app/App.js';

export async function createDev(app: App): Promise<ViteDevServer> {
  return createServer({});
}
