/// <reference types="node" />

export * from './app/App';
export * from './app/config';
export * from './app/files';
export * from './app/routes';
export type { BuildBundles, BuildData } from './build';
export type {
  BuildAdapter,
  BuildAdapterFactory,
  BuildAdapterUtils,
} from './build/adapter';
export {
  type AutoBuildAdapterConfig,
  createAutoBuildAdapter,
} from './build/adapter';
export type { StaticBuildAdapterConfig } from './build/adapter/static/adapter';
export type { VercelBuildAdapterConfig } from './build/adapter/vercel/adapter';
export * from './http';
export type {
  HighlightCodeBlock,
  MarkdocAstTransformer,
  MarkdocContentTransformer,
  MarkdocMetaTransformer,
  MarkdocOutputTransformer,
  MarkdocRenderer,
  MarkdocSchema,
  MarkdocTreeNodeTransformer,
  MarkdocTreeWalkStuff,
  ParseMarkdownConfig,
  RenderMarkdocConfig,
} from './markdoc';
export { renderMarkdocToHTML } from './markdoc';
export * from './utils';
export * from './vite/alias';
export * from './vite/Plugin';
export {
  vitebookPlugin as default,
  vitebookPlugin as vitebook,
  type VitebookPluginConfig,
} from './vite/vitebook-plugin';
export type {
  Config as MarkdocConfig,
  Node as MarkdocNode,
  RenderableTreeNode as MarkdocRenderableTreeNode,
  RenderableTreeNodes as MarkdocRenderableTreeNodes,
  Tag as MarkdocTag,
} from '@markdoc/markdoc';
export { default as Markdoc } from '@markdoc/markdoc';
