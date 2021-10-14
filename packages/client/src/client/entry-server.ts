import type { ServerRenderFn, VitebookSSRContext } from '@vitebook/core/node';

import App from './App.svelte';
import {
  PAGE_SSR_CTX_KEY,
  ROUTER_CTX_KEY,
  SSR_CTX_KEY
} from './context/context-keys';
import { createRouter } from './createRouter';

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
  context.set(PAGE_SSR_CTX_KEY, {});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { head, html, css } = (App as any).render({}, { context });

  // page ssr (use head/css)
  const pageRender = context.get(PAGE_SSR_CTX_KEY);

  return { context: ssrContext, html };
};
