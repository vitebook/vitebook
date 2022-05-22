import app from ':virtual/vitebook/app';

import { renderersContextKey } from './context';
import { createRouter } from './createRouter';
import { findViewRenderer, ViewRenderer } from './view/ViewRenderer';

async function mount() {
  const context = new Map();
  const renderers: ViewRenderer[] = [];

  context.set(renderersContextKey, renderers);
  await createRouter({ context, renderers });

  const target = document.getElementById('app')!;
  const renderer = findViewRenderer(app.id, app.module, renderers);

  renderer?.attach({
    target,
    context,
    module: app.module,
    hydrate: import.meta.env.PROD,
  });
}

mount();
