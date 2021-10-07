import { resolveApp } from '../../app/resolveApp';
import type { BuildCommandArgs } from '../args';

export async function buildCommand(args: BuildCommandArgs): Promise<void> {
  const app = await resolveApp(args);
  await app.build();
}
