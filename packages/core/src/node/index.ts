import type { UserConfig as ViteConfig } from 'vite';

import type { AppConfig } from './app/AppConfig';

export * from './app/alias';
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
export type {
  CorePluginConfig,
  ResolvedCorePluginConfig,
} from './app/plugins/core';
export type {
  HighlightCodeBlock,
  MarkdocAstTransformer,
  MarkdocContentTransformer,
  MarkdocNodeFileMeta,
  MarkdocOutputTransformer,
  MarkdocRenderer,
  MarkdocSchema,
  MarkdocSchemaConfig,
  MarkdocTreeNodeTransformer,
  MarkdocTreeWalkStuff,
  MarkdownPluginConfig,
  ParseMarkdownConfig,
  RenderMarkdocConfig,
  ResolvedMarkdownPluginConfig,
} from './app/plugins/markdown';
export { renderMarkdocToHTML } from './app/plugins/markdown';
export type {
  Pages,
  PagesConfig,
  PagesPluginConfig,
  ResolvedPagesPluginConfig,
} from './app/plugins/pages';
export * from './utils';
export type {
  Config as MarkdocConfig,
  Node as MarkdocNode,
  RenderableTreeNode as MarkdocRenderableTreeNode,
  RenderableTreeNodes as MarkdocRenderableTreeNodes,
  Tag as MarkdocTag,
} from '@markdoc/markdoc';
