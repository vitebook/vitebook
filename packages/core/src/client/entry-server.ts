import type { ServerRenderFn, VitebookSSRContext } from '../shared';
import App from './App.svelte';
import { ROUTER_CTX_KEY } from './context/getRouter';
import { SSR_CTX_KEY } from './context/getSSRContext';
import { createRouter } from './createRouter';

export const render: ServerRenderFn = async (page) => {
  const ssr: VitebookSSRContext = {
    modules: new Set(),
  };

  const router = await createRouter();
  await router.go(page.route);

  const context = new Map();
  context.set(SSR_CTX_KEY, ssr);
  context.set(ROUTER_CTX_KEY, router);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { head, html, css } = (App as any).render({}, { context });

  return { ssr, html, head, css };
};
