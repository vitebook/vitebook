import kleur from 'kleur';

import { type BuildAdapterFactory } from './BuildAdapter';
import { createStaticBuildAdapter } from './static';

export const adapters = [
  {
    name: 'vercel',
    loader: () => import('./vercel/adapter'),
    test: () => !!process.env.VERCEL,
  },
];

export function createAutoBuildAdapter(
  options: { use?: 'static' | 'vercel' } = {},
): BuildAdapterFactory {
  const using = (name: string) =>
    console.log(kleur.bold(kleur.magenta(`\n🏗️  Using ${name} build adapter`)));

  return async (...args) => {
    for (const adapter of adapters) {
      if (options.use ? adapter.name === options.use : adapter.test()) {
        const { default: createAdapter } = await adapter.loader();
        using(adapter.name);
        return createAdapter()(...args);
      }
    }

    using('static');
    return createStaticBuildAdapter()(...args);
  };
}
