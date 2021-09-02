import type { ViteDevServer } from 'vite';

import { resolveApp } from '../app.js';
import type { DevCommandArgs } from '../args.js';

export async function devCommand(args: DevCommandArgs): Promise<ViteDevServer> {
  const app = await resolveApp(args);
  const server = await app.dev();
  return server.listen();
}
