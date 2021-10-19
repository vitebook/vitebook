import type { SvelteConstructor } from '@vitebook/client';
import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page
} from '@vitebook/core/shared';
import type { MarkdownPageMeta } from '@vitebook/markdown/node';

export type SvelteMarkdownPage = Page<SvelteMarkdownPageModule> & {
  type: 'svelte:md';
};

export type SvelteMarkdownPageModule = DefaultPageModule<
  SvelteConstructor,
  MarkdownPageMeta
>;

export type LoadedSvelteMarkdownPage =
  DefaultLoadedPage<SvelteMarkdownPageModule>;
