import { resolveApp } from '../../app/resolveApp.js';
import type { ServeCommandArgs } from '../args.js';

export async function serveCommand(args: ServeCommandArgs): Promise<void> {
  const app = await resolveApp(args);
  await app.serve();
}
