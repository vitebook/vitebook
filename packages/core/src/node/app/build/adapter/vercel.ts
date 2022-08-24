import { type BuildAdapterFactory } from './BuildAdapter';

export function createVercelBuildAdapter(): BuildAdapterFactory {
  return () => {
    return {
      name: 'vercel',
    };
  };
}
