import {
  createServer as createDevServer,
  UserConfig as ViteConfig,
  ViteDevServer
} from 'vite';

import type { App } from '../../App';
import { corePlugin } from './corePlugin';

export async function createServer(
  app: App,
  config?: ViteConfig
): Promise<ViteDevServer> {
  return createDevServer({
    root: app.dirs.root.path,
    base: app.site.options.baseUrl,
    clearScreen: false,
    ...app.options.vite,
    ...(config ?? {}),
    plugins: [await corePlugin(app), ...app.plugins, ...(config?.plugins ?? [])]
  });
}
