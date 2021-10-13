import type { ServerRenderFn, VitebookSSRContext } from '@vitebook/core/node';

import App from './App.svelte';
import { ROUTER_CTX_KEY, SSR_CTX_KEY } from './context/context-keys';
import { createRouter } from './router';

export const render: ServerRenderFn = async (page) => {
  const ssrContext: VitebookSSRContext = {
    lang: 'en',
    head: [],
    modules: new Set()
  };

  const router = await createRouter();
  await router.go(page.route);

  const context = new Map();
  context.set(SSR_CTX_KEY, ssrContext);
  context.set(ROUTER_CTX_KEY, router);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { head, html, css } = (App as any).render({}, { context });

  return { context: ssrContext, html };
};
