import app from ':virtual/vitebook/app';

import { initAppContext, RENDERERS_CTX_KEY } from './context';
import { createRouter } from './createRouter';
import { findViewRenderer, ViewRenderer } from './view/ViewRenderer';

async function mount() {
  const context = initAppContext();

  const renderers: ViewRenderer[] = [];
  context.set(RENDERERS_CTX_KEY, renderers);

  await createRouter({ context, renderers });

  const target = document.getElementById('app')!;
  const renderer = findViewRenderer(app.id, app.module, renderers);

  renderer?.attach({
    target,
    context,
    module: app.module,
    hydrate: true,
  });
}

mount();
