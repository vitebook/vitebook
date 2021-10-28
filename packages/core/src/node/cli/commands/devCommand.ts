import kleur from 'kleur';
import type { ViteDevServer } from 'vite';

import { resolveApp } from '../../app/resolveApp';
import type { DevCommandArgs } from '../args';

export async function devCommand(args: DevCommandArgs): Promise<ViteDevServer> {
  const app = await resolveApp(args);
  const server = await app.dev();
  console.log(kleur.bold(kleur.cyan(`vitebook@${app.version}\n`)));
  return server.listen().then((server) => {
    server.printUrls();
    console.log();
    return server;
  });
}
