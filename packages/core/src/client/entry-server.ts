import app from ':virtual/vitebook/app';

import type { ServerRenderFn, VitebookSSRContext } from '../shared';
import { renderersContextKey, ssrContextKey } from './context';
import { createRouter } from './createRouter';
import { findViewRenderer, type ViewRenderer } from './view/ViewRenderer';

export const render: ServerRenderFn = async (page) => {
  const context = new Map();
  const renderers: ViewRenderer[] = [];
  const ssr: VitebookSSRContext = { modules: new Set() };

  context.set(ssrContextKey, ssr);
  context.set(renderersContextKey, renderers);

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
