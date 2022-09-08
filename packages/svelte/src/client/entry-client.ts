import { installURLPattern } from 'vitebook';

import app from ':virtual/vitebook/app';

import { type SvelteModule } from '../shared';
import { init } from './init';

async function mount() {
  await installURLPattern();

  const { router, context } = await init();

  await router.go(location.href, { replace: true });
  router.listen();

  const target = document.getElementById('app')!;
  const mod = app.module as SvelteModule;
  new mod.default({ target, context, hydrate: true });

  removeSSRStyles();
}

mount();
