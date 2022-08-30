import { installURLPattern } from 'vitebook';

import app from ':virtual/vitebook/app';

import { type SvelteModule } from '../shared';
import { init } from './init';

async function mount() {
  await installURLPattern();

  const { router, context } = await init();

  await router.go(location.href, { replace: true });
  router.start();

  const target = document.getElementById('app')!;
  const mod = app.module as SvelteModule;
  new mod.default({ target, context, hydrate: true });

  if (import.meta.env.DEV && !import.meta.env.SSR) {
    const styles = document.getElementById('__VBK_SSR_STYLES__');
    styles?.remove();
  }
}

mount();
