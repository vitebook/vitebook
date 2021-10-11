import { resolveApp } from '../../app/resolveApp';
import type { BuildCommandArgs } from '../args';

export async function buildCommand(args: BuildCommandArgs): Promise<void> {
  process.env.NODE_ENV = 'production';
  const app = await resolveApp(args);
  await app.build();
}
