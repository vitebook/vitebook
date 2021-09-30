import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page,
  ServerPage
} from '@vitebook/core/shared';
import type { SvelteComponent } from 'svelte';
import type { Component } from 'vue';

export type SveltePage = Page<SveltePageModule, SveltePageContext> & {
  type: 'svelte';
};

export type SvelteServerPage = ServerPage<SvelteServerPageContext> & {
  type: 'svelte';
};

export type SveltePageModule = DefaultPageModule<Component>;

export type LoadedSveltePage = DefaultLoadedPage<
  SveltePageModule,
  SveltePageContext
>;

export type SvelteLoaderModule = DefaultPageModule<typeof SvelteComponent>;

export type SveltePageContext = {
  loader: () => Promise<SvelteLoaderModule>;
};

export type SvelteServerPageContext = {
  loader: string;
};

export type ResolvedSvelteServerPage = Partial<SvelteServerPage>;
