import './preflight.css';

import App from './App.svelte';
import { ROUTER_CTX_KEY } from './context/context-keys';
import { createRouter } from './createRouter';

async function mount() {
  const router = await createRouter();

  const context = new Map();
  context.set(ROUTER_CTX_KEY, router);

  // Wait until router is ready before mounting to ensure hydration matches.
  router.isReady.then(() => {
    new App({
      target: document.getElementById('app')!,
      hydrate: import.meta.env.PROD,
      context
    });
  });
}

mount();
