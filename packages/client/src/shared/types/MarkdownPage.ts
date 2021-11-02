import type {
  DefaultLoadedPage,
  DefaultPageModule,
  MarkdownPageMeta,
  Page,
} from '@vitebook/core';

import type { SvelteConstructor } from './SveltePage';

export type MarkdownPage = Page<MarkdownPageModule> & {
  type: `${string}md`;
};

export type MarkdownPageModule = DefaultPageModule<
  SvelteConstructor,
  MarkdownPageMeta
>;

export type LoadedMarkdownPage = DefaultLoadedPage<MarkdownPageModule>;
