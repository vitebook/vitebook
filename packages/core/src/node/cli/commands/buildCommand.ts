import { resolveApp } from '../../app/resolveApp.js';
import type { BuildCommandArgs } from '../args.js';

export async function buildCommand(args: BuildCommandArgs): Promise<void> {
  const app = await resolveApp(args);
  await app.build();
}
