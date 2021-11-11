import './preflight.css';

import { tick } from 'svelte';

import App from './App.svelte';
import { ROUTER_CTX_KEY } from './context/context-keys';
import { createRouter } from './createRouter';

async function mount() {
  const router = await createRouter();

  const context = new Map();
  context.set(ROUTER_CTX_KEY, router);

  // Wait until router is ready before mounting to ensure hydration matches.
  router.waitUntilReady.then(async () => {
    new App({
      target: document.getElementById('app')!,
      hydrate: import.meta.env.PROD,
      context,
    });

    await tick();

    // We call this here incase a hash is set in the URL, as we want to navigate to it after the
    // App has rendered.
    await router.go(location.href, { replace: true });
  });
}

mount();
