import type { SvelteConstructor } from '@vitebook/client';
import type {
  DefaultLoadedPage,
  DefaultPageModule,
  MarkdownPageMeta,
  Page,
} from '@vitebook/core';

export type MarkdownPage = Page<MarkdownPageModule> & {
  type: 'md';
};

export type MarkdownPageModule = DefaultPageModule<
  SvelteConstructor,
  MarkdownPageMeta
>;

export type LoadedMarkdownPage = DefaultLoadedPage<MarkdownPageModule>;

export type {
  MarkdownFrontmatter,
  MarkdownHeader,
  MarkdownLinks,
  MarkdownPageMeta,
} from '@vitebook/core';
