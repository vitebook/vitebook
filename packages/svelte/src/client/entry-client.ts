import App from ':virtual/vitebook/app';

import { type SvelteModule } from '../shared';
import { initClient } from './init-client';

async function mount() {
  const { router, context } = await initClient();

  await router.go(location.href, { replace: true });

  router.start(() => {
    const target = document.getElementById('app')!;
    const mod = App.module as SvelteModule;
    new mod.default({ target, context, hydrate: true });
  });
}

mount();
