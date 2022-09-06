import { type ServerEntryContext, type ServerRenderer } from 'vitebook/server';

import app from ':virtual/vitebook/app';

import { type SvelteServerModule } from '../shared';
import { init } from './init';

export const render: ServerRenderer = async (
  url,
  { serverRouter, staticData },
) => {
  const serverContext: ServerEntryContext = { modules: new Set(), staticData };

  const { router, context } = await init({ serverRouter, serverContext });

  await router.go(decodeURI(url.pathname));

  const mod = app.module as SvelteServerModule;
  const { head, html, css } = await mod.default.render({}, { context });

  return {
    html,
    head,
    css,
    router,
    context: serverContext,
  };
};
