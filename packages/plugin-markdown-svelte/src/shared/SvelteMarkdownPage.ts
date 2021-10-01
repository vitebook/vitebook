import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page
} from '@vitebook/core/shared';
import type { MarkdownPageMeta } from '@vitebook/plugin-markdown/shared';
import type { SvelteComponent } from 'svelte';

export type SvelteMarkdownPage = Page<SvelteMarkdownPageModule> & {
  type: 'svelte:md';
};

export type SvelteMarkdownPageModule = DefaultPageModule<
  typeof SvelteComponent,
  MarkdownPageMeta
>;

export type LoadedSvelteMarkdownPage =
  DefaultLoadedPage<SvelteMarkdownPageModule>;
