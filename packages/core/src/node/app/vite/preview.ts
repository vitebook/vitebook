import type { Server } from 'net';
import { preview as vitePreview, resolveConfig } from 'vite';

import type { App } from '../App';

export async function preview(app: App): Promise<Server> {
  return vitePreview(
    await resolveConfig(app.options.vite, 'serve'),
    app.options.vite.server ?? {}
  );
}
