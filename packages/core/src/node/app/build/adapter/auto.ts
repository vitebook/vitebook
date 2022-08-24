import { type BuildAdapterFactory } from './BuildAdapter';
import { createStaticBuildAdapter } from './static';

export function createAutoBuildAdapter(): BuildAdapterFactory {
  return async (...args) => {
    // TODO: FIND adapter based on process.env()
    // const vercel = await import('./vercel');
    return createStaticBuildAdapter()(...args);
  };
}
