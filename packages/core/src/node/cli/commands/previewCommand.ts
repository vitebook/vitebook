import kleur from 'kleur';
import type { PreviewServer } from 'vite';

import { resolveApp } from '../../app/resolveApp';
import type { PreviewCommandArgs } from '../args';

export async function previewCommand(
  args: PreviewCommandArgs,
): Promise<PreviewServer> {
  process.env.NODE_ENV = 'production';
  const app = await resolveApp(args);
  console.log(kleur.bold(kleur.cyan(`vitebook@${app.version}\n`)));
  return app.preview().then((server) => {
    server.printUrls();
    console.log();
    return server;
  });
}
