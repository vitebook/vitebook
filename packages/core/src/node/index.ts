import { UserConfig as ViteConfig } from 'vite';

import type { AppConfig } from './app/AppOptions';

export * from './app/App';
export * from './app/AppOptions';
export * from './app/plugins/ClientPlugin';
export * from './app/plugins/Plugin';
export * from './cli/run';

export type VitebookConfig = AppConfig | { [root: `$${string}`]: AppConfig };

export function defineConfig(
  config: ViteConfig & { book: VitebookConfig },
): typeof config {
  return config;
}

export * from '../shared';
export { VM_PREFIX } from './app/alias';
export { type CorePluginOptions } from './app/plugins/core';
export { type MarkdownPluginOptions } from './app/plugins/markdown';
export { type Pages, type PagesOptions } from './app/plugins/pages';
export { type PagesPluginOptions } from './app/plugins/pages';
export * from './utils';
