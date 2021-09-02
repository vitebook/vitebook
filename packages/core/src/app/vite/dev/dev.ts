import { createServer, UserConfig as ViteConfig, ViteDevServer } from 'vite';

import type { App } from '../../App.js';
import { corePlugin } from './corePlugin.js';

export async function dev(
  app: App,
  config?: ViteConfig
): Promise<ViteDevServer> {
  return createServer({
    root: app.dirs.src.path,
    base: app.site.options.baseUrl,
    clearScreen: false,
    publicDir: app.dirs.public.path,
    ...app.options.vite,
    ...(config ?? {}),
    plugins: [corePlugin(app), ...app.plugins, ...(config?.plugins ?? [])]
  });
}
