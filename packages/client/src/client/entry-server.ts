import type { ServerRenderFn, VitebookSSRContext } from '@vitebook/core/node';
import { renderToString } from 'vue/server-renderer';

import { createApp } from './main';

export const render: ServerRenderFn = async (page) => {
  const { app, router } = await createApp();

  router.push(page.route);
  await router.isReady();

  const context: VitebookSSRContext = {
    lang: 'en',
    head: [],
    modules: new Set()
  };

  const html = await renderToString(app, context);

  return { context, html };
};
