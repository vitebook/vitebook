import {
  createServer as createDevServer,
  UserConfig as ViteConfig,
  ViteDevServer
} from 'vite';

import type { App } from '../../App.js';
import { corePlugin } from './corePlugin.js';

export async function createServer(
  app: App,
  config?: ViteConfig
): Promise<ViteDevServer> {
  return createDevServer({
    root: app.dirs.src.path,
    base: app.site.options.baseUrl,
    clearScreen: false,
    ...app.options.vite,
    ...(config ?? {}),
    plugins: [await corePlugin(app), ...app.plugins, ...(config?.plugins ?? [])]
  });
}
