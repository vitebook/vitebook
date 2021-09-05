import { resolveApp } from '../../app/resolveApp.js';
import { resolveRelativePath } from '../../utils/path.js';
import type { ServeCommandArgs } from '../args.js';

export async function serveCommand(args: ServeCommandArgs): Promise<void> {
  const app = await resolveApp(args);

  const root = args.root
    ? resolveRelativePath(app.dirs.cwd.path, args.root)
    : app.dirs.out.path;

  await app.serve(root);
}
