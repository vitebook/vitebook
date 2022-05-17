import { UserConfig as ViteConfig } from 'vite';

import type { AppConfig } from './app/AppConfig';

export * from './app/App';
export * from './app/AppConfig';
export * from './app/plugins/ClientPlugin';
export * from './app/plugins/Plugin';
export * from './cli/run';

export type VitebookConfig = AppConfig | { [root: `$${string}`]: AppConfig };

export function defineConfig(
  config: ViteConfig & { vitebook: VitebookConfig },
): typeof config {
  return config;
}

export * from '../shared';
export { VM_PREFIX } from './app/alias';
export {
  type CorePluginConfig,
  type ResolvedCorePluginConfig,
} from './app/plugins/core';
export {
  type HighlightCodeBlock,
  type MarkdownPluginConfig,
  type ParseMarkdownConfig,
  type ResolvedMarkdownPluginConfig,
} from './app/plugins/markdown';
export {
  type MarkdocNodeFileMeta,
  type MarkdocSchema,
  type MarkdocSchemaConfig,
} from './app/plugins/markdown/MarkdocSchema';
export {
  type Pages,
  type PagesConfig,
  type PagesPluginConfig,
  type ResolvedPagesPluginConfig,
} from './app/plugins/pages';
export * from './utils';
