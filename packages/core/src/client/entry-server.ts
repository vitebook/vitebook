import app from ':virtual/vitebook/app';

import type { ServerContext, ServerRenderer } from '../shared';
import { initAppContext, RENDERERS_CTX_KEY, SERVER_CTX_KEY } from './context';
import { createRouter } from './createRouter';
import { findViewRenderer, type ViewRenderer } from './view/ViewRenderer';

export const render: ServerRenderer = async (page, { data }) => {
  const context = initAppContext();

  const renderers: ViewRenderer[] = [];
  context.set(RENDERERS_CTX_KEY, renderers);

  const ssr: ServerContext = { modules: new Set(), data };
  context.set(SERVER_CTX_KEY, ssr);

  const router = await createRouter({ context, renderers });
  await router.go(page.route);

  const renderer = findViewRenderer(app.id, app.module, renderers);

  if (!renderer) return { html: '', ssr };

  const { head, html, css } = await renderer.ssr({
    module: app.module,
    context,
  });

  return { ssr, html, head, css };
};
