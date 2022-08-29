import kleur from 'kleur';

import { type BuildAdapterFactory } from './BuildAdapter';
import { createStaticBuildAdapter } from './static';
import { type VercelBuildAdapterConfig } from './vercel/adapter';

export const adapters = [
  {
    name: 'vercel',
    loader: () => import('./vercel/adapter'),
    test: () => !!process.env.VERCEL,
  },
];

export type AutoBuildAdapterConfig = {
  use?: 'static' | 'vercel';
  vercel?: VercelBuildAdapterConfig;
};

export function createAutoBuildAdapter(
  config?: AutoBuildAdapterConfig,
): BuildAdapterFactory {
  const using = (name: string) =>
    console.log(kleur.bold(kleur.magenta(`\n🏗️  Using ${name} build adapter`)));

  return async (...args) => {
    for (const adapter of adapters) {
      if (adapter.name === config?.use || adapter.test()) {
        const { default: createAdapter } = await adapter.loader();
        using(adapter.name);
        return createAdapter(config?.[adapter.name])(...args);
      }
    }

    const staticAdapter = createStaticBuildAdapter();
    using(staticAdapter.name);
    return staticAdapter(...args);
  };
}
