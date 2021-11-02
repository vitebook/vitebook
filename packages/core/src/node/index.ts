import type { ThemeConfig } from '../shared';
import type { AppConfig } from './app/AppOptions';

export * from './app/App';
export * from './app/AppOptions';
export * from './app/plugin/ClientPlugin';
export * from './app/plugin/Plugin';

export function defineConfig<Theme extends ThemeConfig = ThemeConfig>(
  config: AppConfig<Theme>,
): AppConfig<Theme> {
  return config;
}

export * from '../shared';
export { filePathToRoute } from './app/create/resolvePages';
export { VM_PREFIX } from './app/vite/dev/alias';
