import { preview as vitePreview, PreviewServer } from 'vite';

import type { App } from '../App';

export async function preview(app: App): Promise<PreviewServer> {
  const { host, port, https, open, strictPort } = app.config.cliArgs;

  return vitePreview({
    root: app.dirs.cwd.path,
    ...app.vite?.config,
    build: {
      outDir: app.dirs.cwd.relative(app.dirs.out.path),
    },
    preview: {
      ...app.vite?.config.preview,
      host,
      port,
      https,
      open,
      strictPort,
    },
  });
}
