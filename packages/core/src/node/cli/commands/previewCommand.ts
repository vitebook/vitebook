import { resolveApp } from '../../app/resolveApp';
import type { PreviewCommandArgs } from '../args';

export async function previewCommand(args: PreviewCommandArgs): Promise<void> {
  process.env.NODE_ENV = 'production';
  const app = await resolveApp(args);
  await app.preview();
}
