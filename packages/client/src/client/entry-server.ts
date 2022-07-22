import type { ServerRenderFn } from '@vitebook/core/node';

import App from './App.svelte';
import {
  COMPONENT_SSR_CTX_KEY,
  ROUTER_CTX_KEY,
  SSR_CTX_KEY,
} from './context/context-keys';
import { AppContextMap } from './context/useAppContext';
import { createRouter } from './createRouter';

export const render: ServerRenderFn = async (page) => {
  const ssrContext: AppContextMap[typeof SSR_CTX_KEY] = {
    lang: 'en',
    head: [],
    modules: new Set(),
  };

  const renderSSRContext: AppContextMap[typeof COMPONENT_SSR_CTX_KEY] = {};

  const router = await createRouter();
  await router.go(page.route);

  const context = new Map();
  context.set(SSR_CTX_KEY, ssrContext);
  context.set(ROUTER_CTX_KEY, router);
  context.set(COMPONENT_SSR_CTX_KEY, renderSSRContext);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { head, html, css } = (App as any).render({}, { context });

  head = head ?? '';
  css = css.code ?? '';

  for (const result of Object.values(renderSSRContext)) {
    head += result.head ?? '';
    css += result.css?.code ?? '';
    const ssrRender = (await result.render?.()) ?? [];
    if (ssrRender) html = html.replace(ssrRender[0], ssrRender[1]);
  }

  return { context: ssrContext, html, head, css };
};
