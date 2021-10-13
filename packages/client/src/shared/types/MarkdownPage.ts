import type {
  DefaultLoadedPage,
  DefaultPageModule,
  MarkdownPageMeta,
  Page
} from '@vitebook/core/shared';
import type { SvelteComponent } from 'svelte';

export type MarkdownPage = Page<MarkdownPageModule> & {
  type: `${string}md`;
};

export type MarkdownPageModule = DefaultPageModule<
  typeof SvelteComponent,
  MarkdownPageMeta
>;

export type LoadedMarkdownPage = DefaultLoadedPage<MarkdownPageModule>;
