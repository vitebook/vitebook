import { type ServerContext, type ServerRenderer } from 'vitebook';

import app from ':virtual/vitebook/app';

import { type SvelteServerModule } from '../shared';
import { init } from './init';

export const render: ServerRenderer = async (url, { data }) => {
  const serverContext: ServerContext = { modules: new Set(), data };

  const { router, context } = await init({ serverContext });

  await router.go(decodeURI(url.pathname));

  const mod = app.module as SvelteServerModule;
  const { head, html, css } = await mod.default.render({}, { context });

  return {
    html,
    head,
    css,
    context: serverContext,
  };
};
