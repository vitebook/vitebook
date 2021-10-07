import { resolveApp } from '../../app/resolveApp';
import type { ServeCommandArgs } from '../args';

export async function serveCommand(args: ServeCommandArgs): Promise<void> {
  const app = await resolveApp(args);
  await app.serve();
}
