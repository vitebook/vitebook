import type { AppConfig } from './app/AppOptions.js';

export * from './app/App.js';
export * from './app/AppOptions.js';
export * from './app/plugin/ClientPlugin.js';
export * from './app/plugin/Plugin.js';
export * from './app/site/HeadConfig.js';
export * from './app/site/LocaleConfig.js';
export * from './app/site/Page.js';
export * from './app/site/SiteOptions.js';
export * from './app/site/Theme.js';

export function defineConfig(config: AppConfig): AppConfig {
  return config;
}

export { VM_PREFIX } from './app/vite/dev/alias.js';
