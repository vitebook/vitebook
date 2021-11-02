import {
  createServer as createDevServer,
  mergeConfig,
  UserConfig as ViteConfig,
  ViteDevServer,
} from 'vite';

import type { App } from '../../App';

export async function createServer(
  app: App,
  config?: ViteConfig,
): Promise<ViteDevServer> {
  return createDevServer(mergeConfig(app.options.vite, config ?? {}));
}
