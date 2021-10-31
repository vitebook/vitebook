import { preview as vitePreview, PreviewServer } from 'vite';

import type { App } from '../App';

export async function preview(app: App): Promise<PreviewServer> {
  return vitePreview(app.options.vite);
}
