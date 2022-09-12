import { type ServerEntryContext, type ServerRenderer } from 'vitebook/server';

import app from ':virtual/vitebook/app';

import { type SvelteServerModule } from '../shared';
import { initClient } from './init-client';

export const render: ServerRenderer = async (url) => {
  // const serverContext: ServerEntryContext = {};

  const { router, context } = await initClient();

  await router.go(decodeURI(url.pathname));

  const mod = app.module as SvelteServerModule;
  const { head, html, css } = await mod.default.render({}, { context });

  return {
    html,
    head,
    css,
    router,
    context: {} as any,
  };
};
